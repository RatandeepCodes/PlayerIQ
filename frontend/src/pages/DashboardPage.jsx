const topCards = [
  { label: "Top Overall Rating", value: "91", note: "Elite technical output" },
  { label: "Best Pressure Index", value: "1.12", note: "Late-game rise" },
  { label: "Strongest PPI", value: "89", note: "Balanced contribution" },
  { label: "Live Matches", value: "3", note: "Simulation-ready" },
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
          <span>StatsBomb-ready ingestion</span>
          <span>FastAPI analytics</span>
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
            <p>JWT auth routes, player profile APIs, comparison contract, match simulation hooks, and AI endpoint placeholders.</p>
          </div>
          <div>
            <h3>Frontend</h3>
            <p>Dashboard shell, player card UX, radar visualizations, comparison screen, and live match analysis layout.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

