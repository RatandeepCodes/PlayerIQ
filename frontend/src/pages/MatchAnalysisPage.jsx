import MomentumChart from "../components/MomentumChart.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

const turningPoints = [
  { minute: 16, note: "Bengaluru FC found the first big opening and lifted the crowd." },
  { minute: 39, note: "Kerala Blasters answered with a quick spell of pressure and sharper movement." },
  { minute: 76, note: "A late burst of energy swung the game back toward Bengaluru FC." },
];

export default function MatchAnalysisPage() {
  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Match Day</p>
            <h2>{SHOWCASE_MATCH.title}</h2>
          </div>
          <div className="live-pill">{SHOWCASE_MATCH.competition}</div>
        </div>
        <p className="summary-copy">
          Follow the flow of the game, spot the biggest swings, and understand how the match story changed minute by minute.
        </p>
      </section>

      <MomentumChart />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Key Moments</p>
            <h2>Where the match changed</h2>
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
