import ComparisonRadar from "../components/ComparisonRadar.jsx";
import { SHOWCASE_PLAYERS } from "../config/showcase.js";

export default function ComparisonPage() {
  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Player Comparison</p>
            <h2>
              {SHOWCASE_PLAYERS.comparisonA.name} vs {SHOWCASE_PLAYERS.comparisonB.name}
            </h2>
          </div>
        </div>
        <p className="summary-copy">
          {SHOWCASE_PLAYERS.comparisonA.name} brings finishing instincts and leadership presence, while{" "}
          {SHOWCASE_PLAYERS.comparisonB.name} offers wider progression, pace, and direct attacking threat.
        </p>
      </section>

      <ComparisonRadar />
    </div>
  );
}
