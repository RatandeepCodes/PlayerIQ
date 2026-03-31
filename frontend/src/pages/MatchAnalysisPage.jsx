import MomentumChart from "../components/MomentumChart.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

const turningPoints = [
  { minute: 16, note: "Bengaluru FC found the breakthrough through a high-value final-third action." },
  { minute: 39, note: "Kerala Blasters responded with a transition surge and better territorial control." },
  { minute: 76, note: "Late pressing regain sequence swung momentum back toward Bengaluru FC." },
];

export default function MatchAnalysisPage() {
  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Match Analysis</p>
            <h2>{SHOWCASE_MATCH.title}</h2>
          </div>
          <div className="live-pill">Live Simulation</div>
        </div>
        <p className="summary-copy">
          The live analysis surface is ready for event-stream updates, dynamic player ratings, and turning point annotations from the backend and AI service for {SHOWCASE_MATCH.competition} review demos.
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
