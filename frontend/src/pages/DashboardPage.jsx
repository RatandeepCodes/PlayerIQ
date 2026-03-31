import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const topCards = [
  { label: "Fans' Favourite", value: SHOWCASE_PLAYERS.featured.name, note: "Leading the spotlight this week" },
  { label: "Big Match", value: SHOWCASE_MATCH.title, note: "The next story to watch" },
  { label: "Watchlist", value: SHOWCASE_PLAYERS.compareB.name, note: "Electric form and direct running" },
  { label: "Live Stories", value: "3", note: "Fresh performances ready to explore" },
];

export default function DashboardPage() {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Matchday Home</p>
          <h2>See how your favourite players are shaping the game.</h2>
          <p className="summary-copy">
            PlayerIQ turns match moments into clear football stories, so you can understand who stepped up, who changed the rhythm, and who delivered when it mattered most.
          </p>
        </div>
        <div className="hero-callout">
          <span>Indian stars shown first</span>
          <span>Player stories, not jargon</span>
          <span>Built for real football fans</span>
        </div>
      </section>

      <section className="stat-grid">
        {topCards.map((card) => (
          <article key={card.label} className="stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inside PlayerIQ</p>
            <h2>What you can explore here</h2>
          </div>
        </div>

        <div className="two-column-list">
          <div>
            <h3>Player Stories</h3>
            <p>Open a player page to see strengths, current form, and a clearer picture of how that player is influencing matches.</p>
          </div>
          <div>
            <h3>Match Day Flow</h3>
            <p>Follow a match view to spot turning moments, swings in control, and the phases that shaped the result.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
