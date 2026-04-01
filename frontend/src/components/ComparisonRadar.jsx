import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export default function ComparisonRadar({
  radar = [],
  playerOneName = "Player One",
  playerTwoName = "Player Two",
}) {
  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Head To Head</p>
          <h2>Where each player stands out</h2>
        </div>
      </div>

      {radar.length ? (
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={radar}>
            <PolarGrid stroke="rgba(244, 226, 187, 0.12)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#f6ecd2", fontSize: 12 }} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar
              name={playerOneName}
              dataKey="playerOne"
              stroke="#d7b26d"
              fill="#d7b26d"
              fillOpacity={0.22}
            />
            <Radar
              name={playerTwoName}
              dataKey="playerTwo"
              stroke="#b5442f"
              fill="#b5442f"
              fillOpacity={0.18}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-empty-state">
          <p className="summary-copy">Comparison radar will appear here once both live player profiles are loaded.</p>
        </div>
      )}
    </div>
  );
}
