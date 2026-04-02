export default function PlayerCard({ player, analytics }) {
  const matchesAnalyzed = analytics?.rating?.matchesAnalyzed ?? 0;
  const nationality = player?.nationality || "Global";
  const overallRating = analytics?.overallRating ?? "--";
  const playstyle = analytics?.playstyle || "Live style still building";
  const summary =
    analytics?.summary ||
    "This player page is live, but some deeper match-day notes are still filling in from the analytics service.";

  return (
    <section className="player-card player-hero-card">
      <div className="player-rating-panel">
        <p className="eyebrow">Overall Rating</p>
        <div className="player-rating">{overallRating}</div>
        <small className="player-rating-note">
          {matchesAnalyzed ? `${matchesAnalyzed} matches reviewed` : "Match samples still building"}
        </small>
      </div>

      <div className="player-card-meta">
        <p className="player-name">{player.name}</p>
        <p>
          {player.position} | {player.team}
        </p>
        <div className="player-identity-row">
          <span className="pill">{playstyle}</span>
          <span className="pill">{nationality}</span>
        </div>
        <p className="player-card-summary">{summary}</p>
      </div>
    </section>
  );
}
