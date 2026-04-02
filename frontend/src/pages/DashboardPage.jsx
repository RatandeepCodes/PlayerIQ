import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMatchAnalysis, getMatches, getPlayerProfile, getPlayers } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const FILTER_OPTIONS = [
  { label: "All Players", value: "all" },
  { label: "Attack", value: "attack" },
  { label: "Midfield", value: "midfield" },
  { label: "Defence", value: "defence" },
];

const formatMetric = (value) => (value === null || value === undefined ? "--" : value);
const formatText = (value, fallback) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
};

const getProfileScore = (profile, key) => Number(profile?.overview?.[key] ?? -1);

const pickTopProfile = (profiles, key) =>
  [...profiles].sort((left, right) => getProfileScore(right, key) - getProfileScore(left, key))[0] || null;

const isInFilter = (position = "", filter) => {
  const normalized = String(position).toUpperCase();
  if (filter === "attack") {
    return ["ST", "CF", "LW", "RW", "FW"].some((value) => normalized.includes(value));
  }

  if (filter === "midfield") {
    return ["CM", "CAM", "CDM", "AM", "DM", "LM", "RM"].some((value) => normalized.includes(value));
  }

  if (filter === "defence") {
    return ["CB", "LB", "RB", "WB", "GK"].some((value) => normalized.includes(value));
  }

  return true;
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    loading: true,
    error: null,
    players: [],
    matches: [],
    profiles: [],
    featuredProfile: null,
    topRatedProfile: null,
    pressureProfile: null,
    matchAnalysis: null,
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [directoryResult, matchesResult, analysisResult] = await Promise.allSettled([
          getPlayers({ limit: 12 }),
          getMatches(),
          getMatchAnalysis(SHOWCASE_MATCH.id),
        ]);

        const directoryPlayers = directoryResult.status === "fulfilled" ? directoryResult.value.players || [] : [];
        const matches = matchesResult.status === "fulfilled" ? matchesResult.value.matches || [] : [];
        const matchAnalysis = analysisResult.status === "fulfilled" ? analysisResult.value : null;

        const playerIds = [SHOWCASE_PLAYERS.featured.id, ...directoryPlayers.map((player) => player.playerId)]
          .filter(Boolean)
          .filter((value, index, array) => array.indexOf(value) === index)
          .slice(0, 8);

        const profileResults = await Promise.allSettled(playerIds.map((playerId) => getPlayerProfile(playerId)));
        const profiles = profileResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        if (!active) {
          return;
        }

        setDashboard({
          loading: false,
          error: !directoryPlayers.length && !profiles.length ? "The dashboard could not load player stories right now." : null,
          players: directoryPlayers,
          matches,
          profiles,
          featuredProfile:
            profiles.find((profile) => profile.player.playerId === SHOWCASE_PLAYERS.featured.id) ||
            profiles[0] ||
            null,
          topRatedProfile: pickTopProfile(profiles, "overallRating"),
          pressureProfile: pickTopProfile(profiles, "pressureIndex"),
          matchAnalysis,
        });
      } catch (_error) {
        if (!active) {
          return;
        }

        setDashboard((previous) => ({
          ...previous,
          loading: false,
          error: "The dashboard could not reach the live PlayerIQ services.",
        }));
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (dashboard.loading) {
    return (
      <AppStatusScreen
        eyebrow="Dashboard"
        title="Loading match pulse and player stories"
        message="PlayerIQ is pulling live ratings, match pulse, and fan-facing highlights from the backend."
      />
    );
  }

  if (dashboard.error && !dashboard.players.length && !dashboard.profiles.length) {
    return (
      <AppStatusScreen
        eyebrow="Dashboard"
        title="The dashboard is unavailable right now"
        message={dashboard.error}
        tone="error"
      />
    );
  }

  const featuredProfile = dashboard.featuredProfile;
  const matchSummary = dashboard.matchAnalysis?.summary;
  const matchOverview = dashboard.matchAnalysis?.overview;

  const visibleProfiles = dashboard.profiles.filter((profile) => {
    return isInFilter(profile.player.position, filter);
  });

  const visiblePlayers = visibleProfiles.length
    ? visibleProfiles
    : dashboard.players
        .filter((player) => {
          return isInFilter(player.position, filter);
        })
        .map((player) => ({
          player,
          overview: {
            overallRating: null,
            playstyle: null,
            pressureIndex: null,
            ppi: null,
          },
        }));

  const topCards = [
    {
      label: "Player To Watch",
      value: featuredProfile?.player?.name || SHOWCASE_PLAYERS.featured.name,
      note: featuredProfile?.player?.team || SHOWCASE_PLAYERS.featured.team,
    },
    {
      label: "Top Rating",
      value: formatMetric(dashboard.topRatedProfile?.overview?.overallRating),
      note: dashboard.topRatedProfile?.player?.name || "Latest ratings on the way",
    },
    {
      label: "Big-Game Rating",
      value: formatMetric(dashboard.pressureProfile?.overview?.pressureIndex),
      note: dashboard.pressureProfile?.player?.name || "Standout performer loading",
    },
    {
      label: "Match Centre",
      value: formatMetric(matchSummary?.totalTurningPoints),
      note: matchOverview?.teams?.join(" vs ") || SHOWCASE_MATCH.title,
    },
  ];

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">Home</p>
          <h2>Follow the biggest player stories and match moments in one place.</h2>
          <p className="summary-copy">
            Track form, compare standout names, and jump straight into match analysis without digging through menus.
          </p>
          <div className="dashboard-action-row">
            <Link className="primary-link" to={`/player/${featuredProfile?.player?.playerId || SHOWCASE_PLAYERS.featured.id}`}>
              Open player profile
            </Link>
            <Link className="secondary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              Open match centre
            </Link>
          </div>
        </div>

        <article className="dashboard-feature-card">
          <p className="eyebrow">Spotlight</p>
          <h3>{featuredProfile?.player?.name || SHOWCASE_PLAYERS.featured.name}</h3>
          <p className="dashboard-feature-meta">
            {(featuredProfile?.player?.team || SHOWCASE_PLAYERS.featured.team)}{" "}
            <span className="dashboard-meta-separator">|</span>{" "}
            {featuredProfile?.player?.nationality || "Nationality pending"}
          </p>
          <div className="dashboard-feature-stats">
            <div>
              <span>Overall</span>
              <strong>{formatMetric(featuredProfile?.overview?.overallRating)}</strong>
            </div>
            <div>
              <span>Playstyle</span>
              <strong>{formatText(featuredProfile?.overview?.playstyle, "Building live profile")}</strong>
            </div>
            <div>
              <span>Pressure</span>
              <strong>{formatMetric(featuredProfile?.overview?.pressureIndex)}</strong>
            </div>
          </div>
          <p className="dashboard-feature-summary">
            {featuredProfile?.overview?.reportSummary ||
              "This profile is still building. The latest story, ratings, and match-day clues will appear here as more actions are reviewed."}
          </p>
        </article>
      </section>

      <section className="stat-grid">
        {topCards.map((card) => (
          <article key={card.label} className="stat-card dashboard-stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </section>

      <section className="page-grid dashboard-overview-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Players To Watch</p>
              <h2>Shortlist for today</h2>
            </div>
            <div className="dashboard-filter-row" role="tablist" aria-label="Player dashboard filters">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`dashboard-filter-chip${filter === option.value ? " active" : ""}`}
                  type="button"
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-player-grid">
            {visiblePlayers.slice(0, 6).map((entry) => {
              const player = entry.player || entry;
              const overview = entry.overview || {};

              return (
                <article key={player.playerId} className="dashboard-player-tile">
                  <div className="dashboard-player-header">
                    <div>
                      <h3>{player.name}</h3>
                      <p>
                        {player.team} <span className="dashboard-meta-separator">|</span> {player.position || "Player"}
                      </p>
                    </div>
                    <div className="dashboard-score-badge">{formatMetric(overview.overallRating)}</div>
                  </div>
                  <div className="dashboard-player-tags">
                    <span className="pill">{formatText(overview.playstyle, "Live story building")}</span>
                    <span className="pill">{player.nationality || "Global"}</span>
                  </div>
                  <div className="dashboard-player-stats">
                    <span>PPI {formatMetric(overview.ppi)}</span>
                    <span>Pressure {formatMetric(overview.pressureIndex)}</span>
                  </div>
                  <Link className="secondary-link dashboard-player-link" to={`/player/${player.playerId}`}>
                    Open player page
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel dashboard-match-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Match Centre</p>
              <h2>Matches to follow</h2>
            </div>
            <div className="live-pill">Ready for live feed</div>
          </div>

          <div className="dashboard-match-stats">
            <article>
              <span>Momentum Windows</span>
              <strong>{formatMetric(matchSummary?.totalMomentumWindows)}</strong>
            </article>
            <article>
              <span>Turning Points</span>
              <strong>{formatMetric(matchSummary?.totalTurningPoints)}</strong>
            </article>
            <article>
              <span>Swing Moments</span>
              <strong>{formatMetric(matchSummary?.swingMoments)}</strong>
            </article>
          </div>

          <div className="dashboard-match-list">
            {(dashboard.matches.length ? dashboard.matches : [SHOWCASE_MATCH]).slice(0, 4).map((match) => (
              <Link key={match.matchId || match.id} className="dashboard-match-item" to={`/matches/${match.matchId || match.id}`}>
                <div>
                  <strong>{match.title}</strong>
                  <p>{match.competition}</p>
                </div>
                <span className="pill">Open</span>
              </Link>
            ))}
          </div>

          <div className="dashboard-match-copy">
            <p>
              {matchOverview?.teams?.length
                ? `${matchOverview.teams.join(" vs ")} is ready for a full match breakdown, key turning points, and a live event feed.`
                : `${SHOWCASE_MATCH.title} is ready for a full match breakdown, key turning points, and a live event feed.`}
            </p>
            <p>
              Jump into any available game to switch between matches, start a simulation, and follow the momentum chart live.
            </p>
          </div>

          <div className="dashboard-action-row">
            <Link className="primary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              Open match analysis
            </Link>
            <Link className="secondary-link" to="/compare">
              Compare players
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
