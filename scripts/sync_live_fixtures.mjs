import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const BACKEND_ENV_PATH = path.join(ROOT, "backend", ".env");
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "data", "processed", "live_fixtures_snapshot.json");
const DEFAULT_METADATA_PATH = path.join(ROOT, "data", "processed", "live_fixtures_metadata.json");
const DEFAULT_COMPETITION_CODES = ["PL", "PD", "BL1", "SA", "FL1", "DED", "PPL", "ELC", "CL"];

function parseArgs(argv) {
  const args = {
    competitions: DEFAULT_COMPETITION_CODES,
    recentDays: 3,
    upcomingDays: 14,
    limit: 200,
    output: DEFAULT_OUTPUT_PATH,
    metadata: DEFAULT_METADATA_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--help" || current === "-h") {
      args.help = true;
      return args;
    }

    if (current === "--competitions" && next) {
      args.competitions = next
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (current === "--recent-days" && next) {
      args.recentDays = Number(next);
      index += 1;
      continue;
    }

    if (current === "--upcoming-days" && next) {
      args.upcomingDays = Number(next);
      index += 1;
      continue;
    }

    if (current === "--limit" && next) {
      args.limit = Number(next);
      index += 1;
      continue;
    }

    if (current === "--output" && next) {
      args.output = path.resolve(ROOT, next);
      index += 1;
      continue;
    }

    if (current === "--metadata" && next) {
      args.metadata = path.resolve(ROOT, next);
      index += 1;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/sync_live_fixtures.mjs [options]

Options:
  --competitions <codes>   Comma-separated competition codes (default: ${DEFAULT_COMPETITION_CODES.join(",")})
  --recent-days <number>   How many past days to include for completed/live matches (default: 3)
  --upcoming-days <number> How many future days to include for upcoming fixtures (default: 14)
  --limit <number>         Maximum matches to fetch from the provider (default: 200)
  --output <path>          Output JSON path for normalized fixtures snapshot
  --metadata <path>        Output JSON path for refresh metadata
  -h, --help               Show this message
`);
}

async function loadBackendEnv() {
  try {
    const raw = await readFile(BACKEND_ENV_PATH, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (_error) {
    // backend/.env is optional here; explicit env vars can still drive the script
  }
}

function mapFootballDataStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();

  if (["IN_PLAY", "PAUSED", "LIVE"].includes(normalized)) {
    return "live";
  }

  if (["FINISHED", "AWARDED"].includes(normalized)) {
    return "completed";
  }

  return "upcoming";
}

function formatFixtureTitle(homeTeam, awayTeam) {
  const home = String(homeTeam || "").trim();
  const away = String(awayTeam || "").trim();

  if (home && away) {
    return `${home} vs ${away}`;
  }

  return home || away || "Fixture";
}

function normalizeFixture(match = {}) {
  const homeTeam = String(match.homeTeam?.name || "").trim();
  const awayTeam = String(match.awayTeam?.name || "").trim();
  const seasonStart = match.season?.startDate ? new Date(match.season.startDate).getUTCFullYear() : null;
  const seasonEnd = match.season?.endDate ? new Date(match.season.endDate).getUTCFullYear() : null;

  return {
    matchId: `FD-${match.id}`,
    externalMatchId: String(match.id || ""),
    title: formatFixtureTitle(homeTeam, awayTeam),
    competition: String(match.competition?.name || "").trim() || "Unknown Competition",
    competitionCode: String(match.competition?.code || "").trim() || null,
    season:
      seasonStart && seasonEnd
        ? `${seasonStart}/${seasonEnd}`
        : String(match.season?.currentMatchday || "").trim() || "Unknown",
    utcDate: match.utcDate || null,
    status: mapFootballDataStatus(match.status),
    providerStatus: String(match.status || "").toLowerCase() || "scheduled",
    matchday: match.matchday ?? null,
    stage: match.stage || null,
    venue: match.venue || null,
    homeTeam,
    awayTeam,
    homeScore: Number(match.score?.fullTime?.home ?? 0),
    awayScore: Number(match.score?.fullTime?.away ?? 0),
    teams: [homeTeam, awayTeam].filter(Boolean),
    sources: ["football-data"],
    hasEvents: false,
  };
}

async function fetchFootballDataMatches({ baseUrl, token, competitionCodes, dateFrom, dateTo, limit }) {
  const params = new URLSearchParams({
    competitions: competitionCodes.join(","),
    dateFrom,
    dateTo,
    limit: String(limit),
  });

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/matches?${params.toString()}`, {
    headers: {
      "X-Auth-Token": token,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`football-data request failed (${response.status}): ${text || response.statusText}`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.matches) ? payload.matches : [];
}

function splitMatches(matches) {
  return matches.reduce(
    (groups, match) => {
      if (match.status === "live") {
        groups.liveMatches.push(match);
      } else if (match.status === "completed") {
        groups.completedMatches.push(match);
      } else {
        groups.upcomingMatches.push(match);
      }

      return groups;
    },
    {
      liveMatches: [],
      completedMatches: [],
      upcomingMatches: [],
    },
  );
}

async function writeJson(targetPath, payload) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

async function main() {
  await loadBackendEnv();
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const token = process.env.FOOTBALL_DATA_API_TOKEN || "";
  const baseUrl = process.env.FOOTBALL_DATA_API_BASE_URL || "https://api.football-data.org/v4";

  if (!token) {
    throw new Error("FOOTBALL_DATA_API_TOKEN is missing. Add it to backend/.env before running live fixture sync.");
  }

  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - args.recentDays);
  const to = new Date(today);
  to.setUTCDate(to.getUTCDate() + args.upcomingDays);

  const rawMatches = await fetchFootballDataMatches({
    baseUrl,
    token,
    competitionCodes: args.competitions,
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
    limit: args.limit,
  });

  const normalizedMatches = rawMatches.map(normalizeFixture);
  const grouped = splitMatches(normalizedMatches);

  const snapshot = {
    provider: "football-data",
    generatedAtUtc: new Date().toISOString(),
    filters: {
      competitionCodes: args.competitions,
      recentDays: args.recentDays,
      upcomingDays: args.upcomingDays,
      limit: args.limit,
    },
    ...grouped,
  };

  const metadata = {
    provider: "football-data",
    generatedAtUtc: snapshot.generatedAtUtc,
    competitionCodes: args.competitions,
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
    total: normalizedMatches.length,
    liveCount: grouped.liveMatches.length,
    completedCount: grouped.completedMatches.length,
    upcomingCount: grouped.upcomingMatches.length,
    output: args.output,
  };

  await writeJson(args.output, snapshot);
  await writeJson(args.metadata, metadata);

  console.log(`Live fixture sync completed at ${snapshot.generatedAtUtc}`);
  console.log(`wrote ${metadata.total} matches -> ${args.output}`);
  console.log(`metadata -> ${args.metadata}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
