export default function StatGrid({ analytics }) {
  const stats = [
    ["Shooting", analytics.attributes.shooting],
    ["Passing", analytics.attributes.passing],
    ["Dribbling", analytics.attributes.dribbling],
    ["Defending", analytics.attributes.defending],
    ["Creativity", analytics.attributes.creativity],
    ["Energy", analytics.attributes.physical],
    ["Match Impact", analytics.ppi],
    ["Big-game score", analytics.pressureIndex],
  ];

  return (
    <div className="stat-grid">
      {stats.map(([label, value]) => (
        <article key={label} className="stat-card">
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  );
}

