import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPlayerHistory, getPlayerProfile } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import PlayerHistoryChart from "../components/PlayerHistoryChart.jsx";
import PlayerRadarChart from "../components/PlayerRadarChart.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

const normalizeList = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const formatValue = (value) => (value === null || value === undefined ? "--" : value);

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPlayerStory = async () => {
      setLoading(true);
      setError("");

      const [profileResult, historyResult] = await Promise.allSettled([getPlayerProfile(id), getPlayerHistory(id)]);

      if (!active) {
        return;
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        setProfile(null);
        setError(profileResult.reason?.message || "Player analytics service unavailable");
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value);
      } else {
        setHistory({
          playerId: id,
          snapshots: [],
          metadata: {
            totalSnapshots: 0,
          },
        });
      }

      setLoading(false);
    };

    loadPlayerStory();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AppStatusScreen
        eyebrow="Player Profile"
        title="Loading player story"
        message="PlayerIQ is pulling the latest ratings, pressure moments, and player notes for this page."
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

  const strengths = normalizeList(profile.analytics.report?.strengths);
  const developmentAreas = normalizeList(profile.analytics.report?.developmentAreas);
  const supportingTraits = normalizeList(profile.analytics.playstyleProfile?.supportingTraits);
  const availability = profile.analytics.availability || {};
  const historySnapshots = history?.snapshots || [];

  return (
    <div className="page profile-page">
      <PlayerCard player={profile.player} analytics={profile.analytics} />

      <section className="profile-overview-grid">
        <article className="panel profile-story-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Big Picture</p>
              <h2>What stands out right now</h2>
            </div>
          </div>
          <p className="summary-copy">
            {profile.overview.reportSummary ||
              "This page will surface the biggest talking points around form, playing style, and match-day impact."}
          </p>

          <div className="profile-quick-pulse">
            <article>
              <span>Overall</span>
              <strong>{formatValue(profile.overview.overallRating)}</strong>
            </article>
            <article>
              <span>PPI</span>
              <strong>{formatValue(profile.overview.ppi)}</strong>
            </article>
            <article>
              <span>Pressure</span>
              <strong>{formatValue(profile.overview.pressureIndex)}</strong>
            </article>
            <article>
              <span>Matches Reviewed</span>
              <strong>{formatValue(profile.overview.matchesAnalyzed)}</strong>
            </article>
          </div>
        </article>

        <article className="panel profile-role-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Playing Style</p>
              <h2>{profile.analytics.playstyleProfile?.name || "Player identity"}</h2>
            </div>
          </div>

          <div className="profile-tag-list">
            {supportingTraits.length ? (
              supportingTraits.map((trait) => (
                <span key={trait} className="pill">
                  {trait}
                </span>
              ))
            ) : (
              <span className="pill">Live profile</span>
            )}
          </div>

          <p className="summary-copy">
            {profile.analytics.pressure?.interpretation ||
              "Pressure and style details will appear here as the player profile fills out."}
          </p>

          <div className="profile-status-row">
            <span className="profile-status-pill">
              {availability.isPartial ? "Some live sections are still filling in" : "Full live profile ready"}
            </span>
          </div>
        </article>
      </section>

      <StatGrid analytics={profile.analytics} />

      <section className="page-grid profile-analysis-grid">
        <PlayerRadarChart analytics={profile.analytics} />
        <PlayerHistoryChart history={history} />
      </section>

      <section className="page-grid profile-story-grid">
        <article className="panel profile-list-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Strengths</p>
              <h2>Where this player shines</h2>
            </div>
          </div>

          <div className="profile-bullet-list">
            {strengths.length ? (
              strengths.map((item) => (
                <div key={item} className="profile-bullet-item">
                  <span className="profile-bullet-dot" />
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p className="summary-copy">Strength notes will appear here when the live report adds them.</p>
            )}
          </div>
        </article>

        <article className="panel profile-list-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Growth Areas</p>
              <h2>What to keep an eye on</h2>
            </div>
          </div>

          <div className="profile-bullet-list">
            {developmentAreas.length ? (
              developmentAreas.map((item) => (
                <div key={item} className="profile-bullet-item">
                  <span className="profile-bullet-dot profile-bullet-dot-muted" />
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p className="summary-copy">Growth notes will appear here when the live report adds them.</p>
            )}
          </div>
        </article>
      </section>

      <section className="panel profile-bottom-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Fan View</p>
            <h2>Why this profile matters on match day</h2>
          </div>
        </div>

        <div className="profile-bottom-grid">
          <article>
            <span>Pressure score</span>
            <strong>{formatValue(profile.analytics.pressure?.pressureScore)}</strong>
            <p>{profile.analytics.pressure?.pressureEvents || 0} pressure moments reviewed</p>
          </article>
          <article>
            <span>Snapshot history</span>
            <strong>{history?.metadata?.totalSnapshots || 0}</strong>
            <p>{historySnapshots.length ? "Recent stored reviews are available above." : "No stored review trail yet."}</p>
          </article>
          <article>
            <span>Sources</span>
            <strong>{profile.metadata.sources?.length || 0}</strong>
            <p>{profile.metadata.sources?.join(", ") || "Source tags appear when available."}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
