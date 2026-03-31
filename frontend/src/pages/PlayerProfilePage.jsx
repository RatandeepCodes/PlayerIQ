import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPlayerProfile } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import PlayerRadarChart from "../components/PlayerRadarChart.jsx";
import StatGrid from "../components/StatGrid.jsx";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getPlayerProfile(id);
        if (!isMounted) {
          return;
        }
        setProfile(response);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }
        setProfile(null);
        setError(requestError instanceof Error ? requestError.message : "Unable to load this player right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="page">
        <section className="panel">
          <p className="summary-copy">Loading player story...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <AppStatusScreen
        eyebrow="Player Profile"
        title="This player page is unavailable right now"
        message={error}
        tone="error"
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
