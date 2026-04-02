import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMatchAnalysis, getMatches } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

const formatMetric = (value) => (value === null || value === undefined ? "--" : value);

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    loading: true,
    error: null,
    matches: [],
    matchAnalysis: null,
  });

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [matchesResult, analysisResult] = await Promise.allSettled([
          getMatches(),
          getMatchAnalysis(SHOWCASE_MATCH.id),
        ]);

        const matches = matchesResult.status === "fulfilled" ? matchesResult.value.matches || [] : [];
        const matchAnalysis = analysisResult.status === "fulfilled" ? analysisResult.value : null;

        if (!active) {
          return;
        }

        setDashboard({
          loading: false,
          error: !matches.length ? "The dashboard could not load match stories right now." : null,
          matches,
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
        title="Loading match centre"
        message="PlayerIQ is pulling the latest matches, momentum windows, and turning-point stories."
      />
    );
  }

  if (dashboard.error && !dashboard.matches.length) {
    return (
      <AppStatusScreen
        eyebrow="Dashboard"
        title="The dashboard is unavailable right now"
        message={dashboard.error}
        tone="error"
      />
    );
  }

  const matchSummary = dashboard.matchAnalysis?.summary;
  const matchOverview = dashboard.matchAnalysis?.overview;

  const topCards = [
    {
      label: "Matches Available",
      value: dashboard.matches.length,
      note: "Ready to explore",
    },
    {
      label: "Momentum Windows",
      value: formatMetric(matchSummary?.totalMomentumWindows),
      note: "Across the featured match",
    },
    {
      label: "Turning Points",
      value: formatMetric(matchSummary?.totalTurningPoints),
      note: "Key swings in the story",
    },
    {
      label: "Swing Moments",
      value: formatMetric(matchSummary?.swingMoments),
      note: matchOverview?.teams?.join(" vs ") || SHOWCASE_MATCH.title,
    },
  ];

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">Home</p>
          <h2>Follow the biggest match stories in one place.</h2>
          <p className="summary-copy">
            Open any match, follow the momentum, and see where the key moments shaped the story.
          </p>
          <div className="dashboard-action-row">
            <Link className="secondary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              Open match centre
            </Link>
          </div>
        </div>

        <article className="dashboard-feature-card">
          <p className="eyebrow">Featured Match</p>
          <h3>{matchOverview?.teams?.join(" vs ") || SHOWCASE_MATCH.title}</h3>
          <p className="dashboard-feature-meta">{SHOWCASE_MATCH.competition}</p>
          <div className="dashboard-feature-stats">
            <div>
              <span>Momentum</span>
              <strong>{formatMetric(matchSummary?.totalMomentumWindows)}</strong>
            </div>
            <div>
              <span>Turning Points</span>
              <strong>{formatMetric(matchSummary?.totalTurningPoints)}</strong>
            </div>
            <div>
              <span>Swing Moments</span>
              <strong>{formatMetric(matchSummary?.swingMoments)}</strong>
            </div>
          </div>
          <p className="dashboard-feature-summary">
            Start in the match centre to see momentum swings and turning points in one focused match story.
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

      <section className="dashboard-home-grid">
        <section className="panel dashboard-match-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Match Centre</p>
              <h2>Matches to follow</h2>
            </div>
            <div className="live-pill">Analysis ready</div>
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
            {(dashboard.matches.length ? dashboard.matches : [SHOWCASE_MATCH]).slice(0, 8).map((match) => (
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
                ? `${matchOverview.teams.join(" vs ")} is ready for a full match breakdown and key turning points.`
                : `${SHOWCASE_MATCH.title} is ready for a full match breakdown and key turning points.`}
            </p>
            <p>
              Jump into any available game to switch between matches and follow the momentum chart window by window.
            </p>
          </div>

          <div className="dashboard-action-row">
            <Link className="primary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              Open match analysis
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
