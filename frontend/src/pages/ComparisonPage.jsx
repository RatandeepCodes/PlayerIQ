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
<<<<<<< HEAD
              {SHOWCASE_PLAYERS.comparisonA.name} vs {SHOWCASE_PLAYERS.comparisonB.name}
=======
              {SHOWCASE_PLAYERS.compareA.name} vs {SHOWCASE_PLAYERS.compareB.name}
>>>>>>> BugsAndFixes
            </h2>
          </div>
        </div>
        <p className="summary-copy">
<<<<<<< HEAD
          {SHOWCASE_PLAYERS.comparisonA.name} brings finishing instincts and leadership presence, while{" "}
          {SHOWCASE_PLAYERS.comparisonB.name} offers wider progression, pace, and direct attacking threat.
=======
          Put two players side by side and see who brings more threat, who carries the attack, and who looks ready for the biggest moments.
>>>>>>> BugsAndFixes
        </p>
      </section>

      <ComparisonRadar />
    </div>
  );
}
