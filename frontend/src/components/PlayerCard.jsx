export default function PlayerCard({ player, analytics }) {
  return (
    <section className="player-card">
      <div>
        <p className="eyebrow">Player Score</p>
        <div className="player-rating">{analytics.overallRating}</div>
      </div>

      <div className="player-card-meta">
        <p className="player-name">{player.name}</p>
        <p>
          {player.position} | {player.team}
        </p>
        <div className="hero-callout">
          <span>{analytics.playstyle}</span>
          <span>{player.nationality || "Football"}</span>
        </div>
        <p className="summary-copy">{analytics.summary}</p>
      </div>
    </section>
  );
}
