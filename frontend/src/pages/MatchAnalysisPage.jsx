import MomentumChart from "../components/MomentumChart.jsx";
import { SHOWCASE_MATCH } from "../config/showcase.js";

const turningPoints = [
<<<<<<< HEAD
  { minute: 16, note: "Bengaluru FC found the breakthrough through a high-value final-third action." },
  { minute: 39, note: "Kerala Blasters responded with a transition surge and better territorial control." },
  { minute: 76, note: "Late pressing regain sequence swung momentum back toward Bengaluru FC." },
=======
  { minute: 16, note: "Bengaluru FC found the first big opening and lifted the crowd." },
  { minute: 39, note: "Kerala Blasters answered with a quick spell of pressure and sharper movement." },
  { minute: 76, note: "A late burst of energy swung the game back toward Bengaluru FC." },
>>>>>>> BugsAndFixes
];

export default function MatchAnalysisPage() {
  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
<<<<<<< HEAD
            <p className="eyebrow">Match Analysis</p>
=======
            <p className="eyebrow">Match Day</p>
>>>>>>> BugsAndFixes
            <h2>{SHOWCASE_MATCH.title}</h2>
          </div>
          <div className="live-pill">{SHOWCASE_MATCH.competition}</div>
        </div>
        <p className="summary-copy">
<<<<<<< HEAD
          The live analysis surface is ready for event-stream updates, dynamic player ratings, and turning point annotations from the backend and AI service for {SHOWCASE_MATCH.competition} review demos.
=======
          Follow the flow of the game, spot the biggest swings, and understand how the match story changed minute by minute.
>>>>>>> BugsAndFixes
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
