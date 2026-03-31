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
              {SHOWCASE_PLAYERS.compareA.name} vs {SHOWCASE_PLAYERS.compareB.name}
            </h2>
          </div>
        </div>
        <p className="summary-copy">
          Put two players side by side and see who brings more threat, who carries the attack, and who looks ready for the biggest moments.
        </p>
      </section>

      <ComparisonRadar />
    </div>
  );
}
