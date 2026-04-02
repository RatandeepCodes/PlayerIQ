import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

import {
  controlMatchSimulation,
  getMatchAnalysis,
  getMatches,
  getMatchSimulation,
  startMatchSimulation,
} from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import MomentumChart from "../components/MomentumChart.jsx";
import SearchPicker from "../components/SearchPicker.jsx";
import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const fallbackMatchTitle = (matchId) => (matchId === SHOWCASE_MATCH.id ? SHOWCASE_MATCH.title : `Match ${matchId}`);

const controlLabels = {
  start: "Start live run",
  pause: "Pause",
  resume: "Resume",
  step: "Step",
  reset: "Reset",
};

const formatEventLabel = (event) => {
  if (!event) {
    return "No live event yet";
  }

  return `${event.minute}' ${event.player_name || event.playerName || "Player"} | ${event.event_type || event.eventType || "event"}`;
};

const formatEventDescription = (event) => {
  if (!event) {
    return "Start the simulation to begin the live event stream.";
  }

  return `${event.team || "Team"} against ${event.opponent || "their opponent"}${event.outcome ? ` | ${event.outcome}` : ""}`;
};

const formatFeedTitle = (event) => `${event.player_name || event.playerName || "Player"} | ${event.team || "Team"}`;
const formatFeedDetail = (event) =>
  `${(event.event_type || event.eventType || "event").toUpperCase()}${event.outcome ? ` | ${event.outcome}` : ""}`;

export default function MatchAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [matches, setMatches] = useState([]);
  const [socketError, setSocketError] = useState("");
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMatchDirectory = async () => {
      try {
        const response = await getMatches();
        if (!active) {
          return;
        }

        setMatches(response.matches || []);
      } catch (_error) {
        if (!active) {
          return;
        }

        setMatches([]);
      }
    };

    loadMatchDirectory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadMatchAnalysis = async () => {
      setLoading(true);
      setError("");

      try {
        const [analysisPayload, simulationPayload] = await Promise.allSettled([
          getMatchAnalysis(id),
          getMatchSimulation(id),
        ]);

        if (!active) {
          return;
        }

        if (analysisPayload.status === "fulfilled") {
          setAnalysis(analysisPayload.value);
        } else {
          setAnalysis(null);
          setError(analysisPayload.reason?.message || "Match analysis service unavailable");
        }

        if (simulationPayload.status === "fulfilled") {
          setSimulation(simulationPayload.value);
        } else {
          setSimulation(null);
        }
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

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setSocketError("");
      socket.emit("simulation:join", { matchId: id });
      socket.emit("simulation:sync", { matchId: id });
    });

    socket.on("simulation:state", (payload) => {
      if (payload?.matchId === id) {
        setSimulation(payload);
      }
    });

    socket.on("simulation:update", (payload) => {
      if (payload?.matchId !== id) {
        return;
      }

      setSimulation((previous) =>
        previous
          ? {
              ...previous,
              ...payload,
              recentEvents: payload.currentEvent
                ? [...(previous.recentEvents || []).slice(-4), payload.currentEvent]
                : previous.recentEvents || [],
            }
          : payload,
      );
    });

    socket.on("simulation:error", (payload) => {
      if (String(payload?.message || "").includes("No simulation session exists")) {
        return;
      }

      if (!payload?.matchId || payload.matchId === id) {
        setSocketError(payload?.message || "Simulation socket error");
      }
    });

    socket.on("connect_error", () => {
      setSocketError("Live simulation feed is unavailable right now.");
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleStartSimulation = async () => {
    setControlLoading("start");
    setSocketError("");

    try {
      if (!simulation) {
        await startMatchSimulation(id);
      }

      const session = await controlMatchSimulation(id, "start");
      setSimulation(session);
    } catch (requestError) {
      setSocketError(requestError?.message || "Unable to start the simulation.");
    } finally {
      setControlLoading("");
    }
  };

  const handleControl = async (action, speed) => {
    setControlLoading(action);
    setSocketError("");

    try {
      const session = await controlMatchSimulation(id, action, speed);
      setSimulation(session);
    } catch (requestError) {
      setSocketError(requestError?.message || "Unable to update the simulation.");
    } finally {
      setControlLoading("");
    }
  };

  const simulationControls = simulation?.controls || ["start", "step", "reset", "speed"];
  const teams = analysis?.overview?.teams || analysis?.teams || simulation?.teams || [];
  const title = teams.length ? teams.join(" vs ") : fallbackMatchTitle(id);
  const turningPoints = analysis?.turningPointList || [];
  const peakWindow = analysis?.momentum?.summary?.peakWindow;
  const recentEvents = simulation?.recentEvents || [];
  const speedOptions = useMemo(() => [0.5, 1, 1.5, 2], []);
  const simulationStatusLabel = simulation?.status || "not started";
  const selectedMatch = matches.find((match) => match.matchId === id);
  const matchOptions = matches.map((match) => ({
    value: match.matchId,
    label: match.title,
    meta: match.competition,
  }));

  if (loading) {
    return (
      <AppStatusScreen
        eyebrow="Match Day"
        title="Loading match pulse"
        message="PlayerIQ is reading momentum windows, turning points, and the live simulation state for this game."
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

  return (
    <div className="page match-analysis-page">
      <section className="panel entity-selector-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Match Selector</p>
            <h2>Choose a match to follow live</h2>
          </div>
        </div>

        <div className="entity-selector-row">
          <div className="entity-selector-field">
            <SearchPicker
              label="Match"
              value={id}
              options={matchOptions}
              onChange={(matchId) => navigate(`/matches/${matchId}`)}
              placeholder="Choose a match"
              searchPlaceholder="Search match or competition"
              emptyMessage="No matches found."
            />
          </div>

          <div className="entity-selector-actions">
            <Link className="secondary-link" to="/dashboard">
              Back to dashboard
            </Link>
            <Link className="secondary-link" to={`/player/${SHOWCASE_PLAYERS.featured.id}`}>
              Open player view
            </Link>
          </div>
        </div>
      </section>

      <section className="match-hero-grid">
        <article className="panel match-hero-copy">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Match Day</p>
              <h2>{title}</h2>
            </div>
            <div className="live-pill">{selectedMatch?.competition || SHOWCASE_MATCH.competition}</div>
          </div>

          <p className="summary-copy">
            Follow the flow of the game, see where control changed hands, and understand the biggest moments that shaped
            the result.
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

      <section className="page-grid match-realtime-grid">
        <section className="panel simulation-control-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live Simulation</p>
              <h2>Control the match feed</h2>
            </div>
            <span className="pill">{simulationStatusLabel}</span>
          </div>

          <div className="simulation-current-event">
            <strong>{formatEventLabel(simulation?.currentEvent)}</strong>
            <p>{formatEventDescription(simulation?.currentEvent)}</p>
          </div>

          <div className="simulation-progress-block">
            <div className="simulation-progress-meta">
              <span>Progress</span>
              <strong>{simulation?.progress ?? 0}%</strong>
            </div>
            <div className="simulation-progress-track">
              <div className="simulation-progress-fill" style={{ width: `${simulation?.progress ?? 0}%` }} />
            </div>
          </div>

          {!simulation ? (
            <p className="simulation-helper-copy">
              Start a live run to begin the event feed for this match.
            </p>
          ) : null}

          <div className="simulation-control-row">
            {!simulation ? (
              <button
                className="primary-link simulation-button"
                type="button"
                onClick={handleStartSimulation}
                disabled={controlLoading === "start"}
              >
                {controlLoading === "start" ? "Starting..." : "Start live run"}
              </button>
            ) : (
              simulationControls
                .filter((action) => action !== "speed")
                .map((action) => (
                  <button
                    key={action}
                    className={`simulation-button ${action === "reset" ? "secondary-link" : "primary-link"}`}
                    type="button"
                    onClick={() => (action === "start" ? handleStartSimulation() : handleControl(action))}
                    disabled={Boolean(controlLoading)}
                  >
                    {controlLoading === action ? "Updating..." : controlLabels[action] || action}
                  </button>
                ))
            )}
          </div>

          {simulation ? (
            <div className="simulation-speed-row">
              <span>Playback speed</span>
              <div className="simulation-speed-options">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    className={`simulation-speed-chip${Number(simulation.playbackSpeed || 1) === speed ? " active" : ""}`}
                    type="button"
                    onClick={() => handleControl("speed", speed)}
                    disabled={Boolean(controlLoading)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {socketError ? <p className="auth-error comparison-inline-error">{socketError}</p> : null}
        </section>

        <section className="panel simulation-feed-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Event Feed</p>
              <h2>Recent match events</h2>
            </div>
            <span className="pill">Minute {simulation?.currentMinute ?? 0}</span>
          </div>

          <div className="simulation-event-list">
            {recentEvents.length ? (
              [...recentEvents].reverse().map((event, index) => (
                <article key={`${event.minute}-${event.second}-${event.player_id || index}`} className="simulation-event-item">
                  <strong>{event.minute}'</strong>
                  <div>
                    <span>{formatFeedTitle(event)}</span>
                    <p>{formatFeedDetail(event)}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="summary-copy">Start the simulation to watch the event feed build in real time.</p>
            )}
          </div>
        </section>
      </section>

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
