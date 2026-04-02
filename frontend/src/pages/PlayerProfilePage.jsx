import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getPlayerProfile, getPlayers } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import PlayerRadarChart from "../components/PlayerRadarChart.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    Promise.allSettled([getPlayerProfile(id), getPlayers()])
      .then(([profileResult, playersResult]) => {
        if (!active) {
          return;
        }

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
        } else {
          setProfile(null);
          setError(profileResult.reason?.message || "This player page is unavailable right now");
        }

        if (playersResult.status === "fulfilled") {
          setPlayers(playersResult.value.players || []);
        } else {
          setPlayers([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AppStatusScreen
        eyebrow="Player Profile"
        title="Loading player story"
        message="PlayerIQ is pulling the latest ratings, style notes, and pressure picture for this player."
      />
    );
  }

  if (!profile) {
    return (
      <AppStatusScreen
        eyebrow="Player Profile"
        title="This player page is unavailable right now"
        message={error}
        tone="error"
        action={
          <div className="action-row">
            <Link className="primary-link" to="/dashboard">
              Back to dashboard
            </Link>
            <Link className="secondary-link" to={`/matches/${SHOWCASE_MATCH.id}`}>
              Open match story
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="page">
      <PlayerCard player={profile.player} analytics={profile.analytics} />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Player Switcher</p>
            <h2>Jump to another player</h2>
          </div>
        </div>
        <div className="selector-row">
          <select
            className="selector-input"
            value={id}
            onChange={(event) => navigate(`/player/${event.target.value}`)}
          >
            {players.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {player.playerName} - {player.team}
              </option>
            ))}
          </select>
        </div>
      </section>

      <StatGrid analytics={profile.analytics} />

      <section className="page-grid">
        <PlayerRadarChart analytics={profile.analytics} />

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Big Picture</p>
              <h2>What stands out</h2>
            </div>
          </div>
          <p className="summary-copy">{profile.analytics.summary}</p>
          {profile.analytics.pressure ? (
            <div className="detail-note-block">
              <p><strong>Big-game read:</strong> {profile.analytics.pressure.note}</p>
              <p><strong>Pressure moments reviewed:</strong> {profile.analytics.pressure.events}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
