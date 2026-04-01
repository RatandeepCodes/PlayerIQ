import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPlayerProfile } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import PlayerRadarChart from "../components/PlayerRadarChart.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getPlayerProfile(id)
      .then((payload) => {
        if (!active) {
          return;
        }

        setProfile(payload);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }

        setProfile(null);
        setError(requestError?.message || "Player analytics service unavailable");
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
      <StatGrid analytics={profile.analytics} />

      <section className="page-grid">
        <PlayerRadarChart analytics={profile.analytics} />

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Big Picture</p>
              <h2>What stood out</h2>
            </div>
          </div>
          <p className="summary-copy">{profile.analytics.summary}</p>
        </div>
      </section>
    </div>
  );
}
