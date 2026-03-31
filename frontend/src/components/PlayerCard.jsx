export default function PlayerCard({ player, analytics }) {
  return (
    <section className="player-card">
      <div>
        <p className="eyebrow">Overall Rating</p>
        <div className="player-rating">{analytics.overallRating}</div>
      </div>

      <div className="player-card-meta">
        <p className="player-name">{player.name}</p>
        <p>
          {player.position} | {player.team}
        </p>
        <span className="pill">{analytics.playstyle}</span>
      </div>
    </section>
  );
}
