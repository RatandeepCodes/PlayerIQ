import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPlayerProfile } from "../api/client.js";
import PlayerCard from "../components/PlayerCard.jsx";
import PlayerRadarChart from "../components/PlayerRadarChart.jsx";
import StatGrid from "../components/StatGrid.jsx";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getPlayerProfile(id).then(setProfile);
  }, [id]);

  if (!profile) {
    return <div className="page">Loading player profile...</div>;
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
              <p className="eyebrow">AI Summary</p>
              <h2>Performance Interpretation</h2>
            </div>
          </div>
          <p className="summary-copy">{profile.analytics.summary}</p>
        </div>
      </section>
    </div>
  );
}

