import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMatchAnalysis, getPlayerProfile, getPlayers } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const FILTER_OPTIONS = [
  { label: "All Players", value: "all" },
  { label: "Indian Names First", value: "india" },
  { label: "Global Names", value: "global" },
];

const formatMetric = (value) => (value === null || value === undefined ? "--" : value);

const getProfileScore = (profile, key) => Number(profile?.overview?.[key] ?? -1);

const pickTopProfile = (profiles, key) =>
  [...profiles].sort((left, right) => getProfileScore(right, key) - getProfileScore(left, key))[0] || null;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    loading: true,
    error: null,
    players: [],
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
        const [directoryResult, analysisResult] = await Promise.allSettled([
          getPlayers({ limit: 8 }),
          getMatchAnalysis(SHOWCASE_MATCH.id),
        ]);

        const directoryPlayers = directoryResult.status === "fulfilled" ? directoryResult.value.players || [] : [];
        const matchAnalysis = analysisResult.status === "fulfilled" ? analysisResult.value : null;

        const playerIds = [
          SHOWCASE_PLAYERS.primary.id,
          ...directoryPlayers.map((player) => player.playerId),
        ]
          .filter(Boolean)
          .filter((value, index, array) => array.indexOf(value) === index)
          .slice(0, 6);

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
          profiles,
          featuredProfile:
            profiles.find((profile) => profile.player.playerId === SHOWCASE_PLAYERS.primary.id) ||
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
    if (filter === "india") {
      return String(profile.player.nationality || "").toLowerCase() === "india";
    }

    if (filter === "global") {
      return String(profile.player.nationality || "").toLowerCase() !== "india";
    }

    return true;
  });

  const visiblePlayers = visibleProfiles.length
    ? visibleProfiles
    : dashboard.players
        .filter((player) => {
          if (filter === "india") {
            return String(player.nationality || "").toLowerCase() === "india";
          }

          if (filter === "global") {
            return String(player.nationality || "").toLowerCase() !== "india";
          }

          return true;
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
      label: "Featured Name",
      value: featuredProfile?.player?.name || SHOWCASE_PLAYERS.primary.name,
      note: featuredProfile?.player?.team || SHOWCASE_PLAYERS.primary.team,
    },
    {
      label: "Best Rating In View",
      value: formatMetric(dashboard.topRatedProfile?.overview?.overallRating),
      note: dashboard.topRatedProfile?.player?.name || "Waiting for live ratings",
    },
    {
      label: "Clutch Performer",
      value: formatMetric(dashboard.pressureProfile?.overview?.pressureIndex),
      note: dashboard.pressureProfile?.player?.name || "Waiting for pressure profile",
    },
    {
      label: "Match Pulse",
      value: formatMetric(matchSummary?.totalTurningPoints),
      note: matchOverview?.teams?.join(" vs ") || SHOWCASE_MATCH.title,
    },
  ];

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">Matchday Dashboard</p>
          <h2>Football stories, player form, and live match pulse in one place.</h2>
          <p className="summary-copy">
            The dashboard now reads from your live backend: player directory, individual ratings, and the featured
            match pulse all come from the PlayerIQ stack instead of static scaffold content.
          </p>
          <div className="dashboard-action-row">
            <Link className="primary-link" to={`/player/${featuredProfile?.player?.playerId || SHOWCASE_PLAYERS.primary.id}`}>
              Open featured player
            </Link>
            <Link className="secondary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              View match story
            </Link>
          </div>
        </div>

        <article className="dashboard-feature-card">
          <p className="eyebrow">Featured Player</p>
          <h3>{featuredProfile?.player?.name || SHOWCASE_PLAYERS.primary.name}</h3>
          <p className="dashboard-feature-meta">
            {(featuredProfile?.player?.team || SHOWCASE_PLAYERS.primary.team)}{" "}
            <span className="dashboard-meta-separator">|</span>{" "}
            {featuredProfile?.player?.nationality || "India"}
          </p>
          <div className="dashboard-feature-stats">
            <div>
              <span>Overall</span>
              <strong>{formatMetric(featuredProfile?.overview?.overallRating)}</strong>
            </div>
            <div>
              <span>Playstyle</span>
              <strong>{featuredProfile?.overview?.playstyle || "Waiting"}</strong>
            </div>
            <div>
              <span>Pressure</span>
              <strong>{formatMetric(featuredProfile?.overview?.pressureIndex)}</strong>
            </div>
          </div>
          <p className="dashboard-feature-summary">
            {featuredProfile?.overview?.reportSummary || "Live profile summary will appear here as soon as the profile loads."}
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
              <h2>Fan-facing player board</h2>
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
                    <span className="pill">{overview.playstyle || player.nationality || "Football"}</span>
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
              <p className="eyebrow">Match Pulse</p>
              <h2>{SHOWCASE_MATCH.title}</h2>
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

          <div className="dashboard-match-copy">
            <p>
              {matchOverview?.teams?.length
                ? `${matchOverview.teams.join(" vs ")} is ready for live breakdown, key swing moments, and fan-friendly review cards.`
                : `${SHOWCASE_MATCH.title} is ready for live breakdown, key swing moments, and fan-friendly review cards.`}
            </p>
            <p>
              Use this panel as the quick pulse before jumping into the full match page for momentum charts and turning
              point details.
            </p>
          </div>

          <div className="dashboard-action-row">
            <Link className="primary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              Open match analysis
            </Link>
            <Link className="secondary-link" to="/compare">
              Compare featured names
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
