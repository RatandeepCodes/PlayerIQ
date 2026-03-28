import MomentumChart from "../components/MomentumChart.jsx";

const turningPoints = [
  { minute: 14, note: "Northbridge FC sustained pressure" },
  { minute: 39, note: "Eastbay United transition surge" },
  { minute: 76, note: "Late pressing regain sequence" },
];

export default function MatchAnalysisPage() {
  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Match Analysis</p>
            <h2>Simulated Real-Time Intelligence</h2>
          </div>
          <div className="live-pill">Live Simulation</div>
        </div>
        <p className="summary-copy">
          The live analysis surface is ready for event-stream updates, dynamic player ratings, and turning point annotations from the backend and AI service.
        </p>
      </section>

      <MomentumChart />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Turning Points</p>
            <h2>Detected Momentum Shifts</h2>
          </div>
        </div>

        <div className="turning-point-list">
          {turningPoints.map((point) => (
            <article key={point.minute} className="turning-point">
              <strong>{point.minute}'</strong>
              <span>{point.note}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

