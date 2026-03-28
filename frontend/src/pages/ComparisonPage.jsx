import ComparisonRadar from "../components/ComparisonRadar.jsx";

export default function ComparisonPage() {
  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Player Comparison</p>
            <h2>Alex Mercer vs Mateo Rios</h2>
          </div>
        </div>
        <p className="summary-copy">
          Alex Mercer leads on creation and passing control, while Mateo Rios offers the sharper direct threat through dribbling volume and shot output.
        </p>
      </section>

      <ComparisonRadar />
    </div>
  );
}

