import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const topCards = [
  { label: "Featured Review Player", value: SHOWCASE_PLAYERS.primary.name, note: SHOWCASE_PLAYERS.primary.team },
  { label: "Comparison Spotlight", value: SHOWCASE_PLAYERS.comparisonB.name, note: SHOWCASE_PLAYERS.comparisonB.team },
  { label: "Review Match", value: SHOWCASE_MATCH.competition, note: SHOWCASE_MATCH.title },
  { label: "Live Stack", value: "Frontend + Backend + AI", note: "Simulation-ready foundation" },
];

export default function DashboardPage() {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Player intelligence built from every touch, duel, and decision.</h2>
        </div>
        <div className="hero-callout">
          <span>Global football coverage</span>
          <span>Indian players shown first for demo flows</span>
          <span>Simulated live updates</span>
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
            <p className="eyebrow">What This Scaffold Includes</p>
            <h2>V1 Platform Surface</h2>
          </div>
        </div>

        <div className="two-column-list">
          <div>
            <h3>Backend + AI</h3>
            <p>JWT auth routes, player profile APIs, comparison contracts, match simulation hooks, and demo-friendly player ordering.</p>
          </div>
          <div>
            <h3>Frontend</h3>
            <p>Dashboard shell, real auth flow, Indian-player showcase defaults, radar visualizations, and live match analysis layout.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
