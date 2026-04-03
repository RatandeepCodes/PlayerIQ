import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMatchAnalysis, getMatches } from "@/api/client.js";
import Footer from "@/components/Footer";
import MomentumChart from "@/components/MomentumChart.tsx";
import Navbar from "@/components/Navbar";
import SearchableSelect from "@/components/SearchableSelect";
import SectionHeader from "@/components/SectionHeader";
import { matches as fallbackMatches } from "@/data/mockData";
import type { ApiMatchAnalysisResponse, ApiMatchBucket, ApiMatchDirectoryEntry, ApiTurningPoint } from "@/types/api";

type MatchMomentumPoint = {
  minute: number;
  label?: string;
  home: number;
  away: number;
};

type MatchPhase = {
  title: string;
  minutes: string;
  description: string;
};

type MatchTurningPoint = {
  minute: number;
  event: string;
  description: string;
};

type MatchStat = {
  label: string;
  home: number;
  away: number;
};

const defaultFallbackMatch = fallbackMatches[0];

const normalizeLabel = (value?: string | null) => (value || "").trim().toLowerCase();

const formatWindowLabel = (start: number, end: number) => `${start}'-${end}'`;

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const findFallbackMatch = (teams: string[] = []) =>
  fallbackMatches.find(
    (candidate) =>
      normalizeLabel(candidate.homeTeam) === normalizeLabel(teams[0]) &&
      normalizeLabel(candidate.awayTeam) === normalizeLabel(teams[1]),
  ) || null;

const buildMomentumPoints = (
  buckets: ApiMatchBucket[],
  homeTeam: string,
  awayTeam: string,
  fallbackMomentum: MatchMomentumPoint[] = [],
): MatchMomentumPoint[] => {
  if (!buckets.length) {
    return fallbackMomentum;
  }

  return buckets.map((bucket, index) => {
    const bucketStart = toNumber(bucket.bucketStart ?? bucket.startMinute, index * 5);
    const bucketEnd = toNumber(bucket.bucketEnd ?? bucket.endMinute, bucketStart + 4);

    return {
      minute: toNumber(bucket.minuteMark ?? bucket.bucketEnd ?? bucket.bucketStart, bucketEnd),
      label: bucket.label || formatWindowLabel(bucketStart, bucketEnd),
      home: toNumber(bucket.scores?.[homeTeam]),
      away: toNumber(bucket.scores?.[awayTeam]),
    };
  });
};

const buildTurningPoints = (
  analysis: ApiMatchAnalysisResponse | null,
  fallbackTurningPoints: MatchTurningPoint[] = [],
): MatchTurningPoint[] => {
  if (analysis?.turningPointList?.length) {
    return analysis.turningPointList.map((point: ApiTurningPoint) => ({
      minute: toNumber(point.minute),
      event: point.team || "Turning Point",
      description: point.note || "A key moment shaped the flow of this match.",
    }));
  }

  return fallbackTurningPoints;
};

const buildPhases = (buckets: ApiMatchBucket[], fallbackPhases: MatchPhase[] = []): MatchPhase[] => {
  if (buckets.length) {
    return buckets.slice(0, 6).map((bucket, index) => {
      const bucketStart = toNumber(bucket.bucketStart ?? bucket.startMinute, index * 5);
      const bucketEnd = toNumber(bucket.bucketEnd ?? bucket.endMinute, bucketStart + 4);

      return {
        title: bucket.leadingTeam ? `${bucket.leadingTeam} spell` : "Balanced phase",
        minutes: bucket.label || formatWindowLabel(bucketStart, bucketEnd),
        description: bucket.note || "Neither side created a clear swing in this phase.",
      };
    });
  }

  return fallbackPhases;
};

const buildStats = (
  buckets: ApiMatchBucket[],
  momentum: MatchMomentumPoint[],
  homeTeam: string,
  awayTeam: string,
  fallbackStats: MatchStat[] = [],
): MatchStat[] => {
  if (!momentum.length) {
    return fallbackStats;
  }

  const totals = momentum.reduce(
    (accumulator, bucket) => ({
      home: accumulator.home + bucket.home,
      away: accumulator.away + bucket.away,
    }),
    { home: 0, away: 0 },
  );

  const leadingWindows = buckets.reduce(
    (accumulator: { home: number; away: number }, bucket) => {
      if (bucket.leadingTeam === homeTeam) {
        accumulator.home += 1;
      }

      if (bucket.leadingTeam === awayTeam) {
        accumulator.away += 1;
      }

      return accumulator;
    },
    { home: 0, away: 0 },
  );

  const swingWindows = buckets.reduce(
    (accumulator: { home: number; away: number }, bucket) => {
      if (!bucket.isSwing) {
        return accumulator;
      }

      if (bucket.leadingTeam === homeTeam) {
        accumulator.home += 1;
      }

      if (bucket.leadingTeam === awayTeam) {
        accumulator.away += 1;
      }

      return accumulator;
    },
    { home: 0, away: 0 },
  );

  const peakWindow = momentum.reduce(
    (accumulator, bucket) => ({
      home: Math.max(accumulator.home, bucket.home),
      away: Math.max(accumulator.away, bucket.away),
    }),
    { home: 0, away: 0 },
  );

  return [
    { label: "Momentum Total", home: Math.round(totals.home * 10) / 10, away: Math.round(totals.away * 10) / 10 },
    { label: "Leading Windows", home: leadingWindows.home, away: leadingWindows.away },
    { label: "Swing Windows", home: swingWindows.home, away: swingWindows.away },
    { label: "Peak Window", home: Math.round(peakWindow.home * 10) / 10, away: Math.round(peakWindow.away * 10) / 10 },
  ];
};

const buildMatchFromAnalysis = ({
  matchId,
  directoryMatch,
  analysis,
}: {
  matchId: string;
  directoryMatch?: ApiMatchDirectoryEntry | null;
  analysis?: ApiMatchAnalysisResponse | null;
}) => {
  const teams = analysis?.overview?.teams?.length
    ? analysis.overview.teams
    : directoryMatch?.teams?.length
      ? directoryMatch.teams
      : [];
  const matchedFallback = findFallbackMatch(teams);
  const shouldUseFallbackStory = Boolean(matchedFallback) || (!directoryMatch && !teams.length);
  const fallbackMatch = matchedFallback || (shouldUseFallbackStory ? defaultFallbackMatch : null);
  const homeTeam = teams[0] || fallbackMatch?.homeTeam || "Home";
  const awayTeam = teams[1] || fallbackMatch?.awayTeam || "Away";
  const buckets = analysis?.momentumBuckets || [];
  const momentum = buildMomentumPoints(buckets, homeTeam, awayTeam, fallbackMatch?.momentum || []);

  return {
    ...(fallbackMatch || {}),
    id: matchId,
    homeTeam,
    awayTeam,
    homeScore: fallbackMatch?.homeScore ?? 0,
    awayScore: fallbackMatch?.awayScore ?? 0,
    competition: directoryMatch?.competition || fallbackMatch?.competition || "Competition",
    date: directoryMatch?.season || fallbackMatch?.date || "Season pending",
    venue: fallbackMatch?.venue || "Venue pending",
    metaLine: [fallbackMatch?.venue || "Venue pending", directoryMatch?.season || fallbackMatch?.date || "Season pending"]
      .filter(Boolean)
      .join(" | "),
    momentum,
    turningPoints: buildTurningPoints(analysis || null, fallbackMatch?.turningPoints || []),
    phases: buildPhases(buckets, fallbackMatch?.phases || []),
    stats: buildStats(buckets, momentum, homeTeam, awayTeam, fallbackMatch?.stats || []),
  };
};

const MatchAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [directoryMatches, setDirectoryMatches] = useState<ApiMatchDirectoryEntry[]>([]);
  const [analysisPayload, setAnalysisPayload] = useState<ApiMatchAnalysisResponse | null>(null);

  useEffect(() => {
    let active = true;

    const loadDirectory = async () => {
      try {
        const response = (await getMatches()) as { matches?: ApiMatchDirectoryEntry[] };
        if (!active) {
          return;
        }

        const matches = response.matches || [];
        setDirectoryMatches(matches);

        if (!id && matches[0]?.matchId) {
          navigate(`/matches/${matches[0].matchId}`, { replace: true });
        }
      } catch (_error) {
        if (!active) {
          return;
        }

        setDirectoryMatches([]);
      }
    };

    loadDirectory();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    let active = true;

    if (!id) {
      return () => {
        active = false;
      };
    }

    const loadAnalysis = async () => {
      try {
        const response = (await getMatchAnalysis(id)) as ApiMatchAnalysisResponse;
        if (!active) {
          return;
        }

        setAnalysisPayload(response);
      } catch (_error) {
        if (!active) {
          return;
        }

        setAnalysisPayload(null);
      }
    };

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [id]);

  const currentMatchId = id || directoryMatches[0]?.matchId || defaultFallbackMatch.id;
  const directoryMatch = directoryMatches.find((candidate) => candidate.matchId === currentMatchId) || null;

  const match = useMemo(
    () =>
      buildMatchFromAnalysis({
        matchId: currentMatchId,
        directoryMatch,
        analysis: analysisPayload,
      }),
    [analysisPayload, currentMatchId, directoryMatch],
  );

  const options = useMemo(() => {
    if (directoryMatches.length) {
      return directoryMatches.map((candidate) => ({
        value: candidate.matchId,
        label: candidate.title || `${candidate.teams?.[0] || "Home"} vs ${candidate.teams?.[1] || "Away"}`,
        subtitle: candidate.competition || "Competition",
      }));
    }

    return fallbackMatches.map((candidate) => ({
      value: candidate.id,
      label: `${candidate.homeTeam} vs ${candidate.awayTeam}`,
      subtitle: candidate.competition,
    }));
  }, [directoryMatches]);

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-sm">
          <SearchableSelect
            options={options}
            value={currentMatchId}
            onChange={(nextId) => navigate(`/matches/${nextId}`)}
            placeholder="Select a match..."
          />
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8 text-center sm:p-12"
        >
          <p className="mb-6 text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground">
            {match.competition}
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="flex-1 text-right">
              <h2 className="font-display text-3xl tracking-wider text-foreground sm:text-5xl">{match.homeTeam}</h2>
            </div>
            <div className="flex items-center gap-3 font-display text-4xl text-foreground sm:text-6xl">
              <span>{match.homeScore}</span>
              <span className="text-2xl text-muted-foreground">-</span>
              <span>{match.awayScore}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl tracking-wider text-foreground sm:text-5xl">{match.awayTeam}</h2>
            </div>
          </div>
          <p className="mt-4 text-xs font-body text-muted-foreground">{match.metaLine}</p>
        </motion.div>
      </section>

      {match.momentum?.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="glass-card rounded-xl p-6">
            <SectionHeader title="Match Momentum" />
            <MomentumChart data={match.momentum} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
          </div>
        </section>
      ) : null}

      {match.turningPoints?.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <SectionHeader title="Turning Points" />
          <div className="space-y-3">
            {match.turningPoints.map((turningPoint, index) => (
              <motion.div
                key={`${turningPoint.minute}-${index}`}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-card flex items-start gap-4 rounded-lg p-4"
              >
                <div className="flex shrink-0 items-center gap-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="font-display text-sm text-foreground">{turningPoint.minute}'</span>
                </div>
                <div>
                  <span className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">
                    {turningPoint.event}
                  </span>
                  <p className="mt-0.5 text-sm font-body text-foreground">{turningPoint.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {match.phases?.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <SectionHeader title="Match Phases" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {match.phases.map((phase, index) => (
              <motion.div
                key={`${phase.title}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Zap size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">
                    {phase.minutes}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-lg tracking-wide text-foreground">{phase.title}</h3>
                <p className="text-sm font-body text-muted-foreground">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {match.stats?.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionHeader title="Match Stats" />
          <div className="space-y-3">
            {match.stats.map((stat) => {
              const total = stat.home + stat.away;
              const homePct = total > 0 ? (stat.home / total) * 100 : 50;

              return (
                <div key={stat.label} className="glass-card rounded-lg p-4">
                  <div className="mb-2 grid grid-cols-3 items-center text-center">
                    <span className="font-display text-lg text-foreground">{stat.home}</span>
                    <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="font-display text-lg text-foreground">{stat.away}</span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="rounded-full bg-foreground transition-all duration-700"
                      style={{ width: `${homePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
};

export default MatchAnalysis;
