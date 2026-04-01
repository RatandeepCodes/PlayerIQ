import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getMatchAnalysis } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import MomentumChart from "../components/MomentumChart.jsx";
import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const fallbackMatchTitle = (matchId) => (matchId === SHOWCASE_MATCH.id ? SHOWCASE_MATCH.title : `Match ${matchId}`);

export default function MatchAnalysisPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMatchAnalysis = async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await getMatchAnalysis(id);
        if (!active) {
          return;
        }

        setAnalysis(payload);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setAnalysis(null);
        setError(requestError?.message || "Match analysis service unavailable");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMatchAnalysis();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AppStatusScreen
        eyebrow="Match Day"
        title="Loading match pulse"
        message="PlayerIQ is reading momentum windows and turning points for this game."
      />
    );
  }

  if (!analysis) {
    return (
      <AppStatusScreen
        eyebrow="Match Day"
        title="This match page is unavailable right now"
        message={error}
        tone="error"
        action={
          <div className="action-row">
            <Link className="primary-link" to="/dashboard">
              Back to dashboard
            </Link>
            <Link className="secondary-link" to="/compare">
              Open comparison
            </Link>
          </div>
        }
      />
    );
  }

  const teams = analysis.overview?.teams || analysis.teams || [];
  const title = teams.length ? teams.join(" vs ") : fallbackMatchTitle(id);
  const turningPoints = analysis.turningPointList || [];
  const peakWindow = analysis.momentum?.summary?.peakWindow;

  return (
    <div className="page match-analysis-page">
      <section className="match-hero-grid">
        <article className="panel match-hero-copy">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Match Day</p>
              <h2>{title}</h2>
            </div>
            <div className="live-pill">{SHOWCASE_MATCH.competition}</div>
          </div>

          <p className="summary-copy">
            Follow the flow of the game, see where control changed hands, and understand the biggest moments that shaped the result.
          </p>

          <div className="match-summary-grid">
            <article>
              <span>Momentum windows</span>
              <strong>{analysis.summary.totalMomentumWindows}</strong>
            </article>
            <article>
              <span>Turning points</span>
              <strong>{analysis.summary.totalTurningPoints}</strong>
            </article>
            <article>
              <span>Swing moments</span>
              <strong>{analysis.summary.swingMoments}</strong>
            </article>
          </div>
        </article>

        <article className="panel match-spotlight-card">
          <p className="eyebrow">Peak Spell</p>
          <h3>{peakWindow?.leader || "Balanced phases"}</h3>
          <p className="summary-copy">
            {peakWindow
              ? `${peakWindow.label} produced the strongest pulse of the game with a momentum score of ${peakWindow.score}.`
              : "Peak momentum details will appear here once the match pulse is available."}
          </p>
          <div className="dashboard-action-row">
            <Link className="primary-link" to="/compare">
              Compare players
            </Link>
            <Link className="secondary-link" to={`/player/${SHOWCASE_PLAYERS.featured.id}`}>
              Open featured player
            </Link>
          </div>
        </article>
      </section>

      <MomentumChart analysis={analysis} title={title} />

      <section className="page-grid match-breakdown-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Turning Points</p>
              <h2>Where the match changed</h2>
            </div>
          </div>

          <div className="turning-point-list">
            {turningPoints.length ? (
              turningPoints.map((point) => (
                <article key={`${point.minute}-${point.team || "balanced"}`} className="turning-point">
                  <strong>{point.minute}'</strong>
                  <div className="turning-point-copy">
                    <span>{point.team || "Balanced phase"}</span>
                    <p>{point.note}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="summary-copy">Turning points will appear here when the match analysis returns them.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Momentum Notes</p>
              <h2>Window-by-window story</h2>
            </div>
          </div>

          <div className="match-window-list">
            {(analysis.momentumBuckets || []).slice(0, 8).map((bucket) => (
              <article key={bucket.label} className="match-window-item">
                <div className="match-window-header">
                  <strong>{bucket.label}</strong>
                  <span>{bucket.leadingTeam || "Even spell"}</span>
                </div>
                <p>{bucket.note || "Neither side created a major swing in this phase."}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
