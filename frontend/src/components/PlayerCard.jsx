export default function PlayerCard({ player, analytics }) {
  const matchesAnalyzed = analytics?.rating?.matchesAnalyzed ?? 0;
  const nationality = player?.nationality || "Global";

  return (
    <section className="player-card player-hero-card">
      <div className="player-rating-panel">
        <p className="eyebrow">Overall Rating</p>
        <div className="player-rating">{analytics.overallRating}</div>
        <small className="player-rating-note">{matchesAnalyzed} matches reviewed</small>
      </div>

      <div className="player-card-meta">
        <p className="player-name">{player.name}</p>
        <p>
          {player.position} | {player.team}
        </p>
        <div className="player-identity-row">
          <span className="pill">{analytics.playstyle}</span>
          <span className="pill">{nationality}</span>
        </div>
        <p className="player-card-summary">
          {analytics.summary || "This player profile is ready for live ratings, fan-facing insights, and match-day review."}
        </p>
      </div>
    </section>
  );
}
