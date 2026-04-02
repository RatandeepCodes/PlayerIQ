import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const fallbackData = [
  { metric: "Finishing", playerOne: 0, playerTwo: 0 },
  { metric: "Passing", playerOne: 0, playerTwo: 0 },
  { metric: "Dribbling", playerOne: 0, playerTwo: 0 },
  { metric: "Defending", playerOne: 0, playerTwo: 0 },
  { metric: "Creativity", playerOne: 0, playerTwo: 0 },
  { metric: "Energy", playerOne: 0, playerTwo: 0 },
];

export default function ComparisonRadar({ comparison }) {
  const data = comparison?.radar?.length ? comparison.radar : fallbackData;

  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Head To Head</p>
          <h2>Where each player stands out</h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(244, 226, 187, 0.12)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#f6ecd2", fontSize: 12 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            name={comparison?.playerOne || "Player One"}
            dataKey="playerOne"
            stroke="#d7b26d"
            fill="#d7b26d"
            fillOpacity={0.22}
          />
          <Radar
            name={comparison?.playerTwo || "Player Two"}
            dataKey="playerTwo"
            stroke="#b5442f"
            fill="#b5442f"
            fillOpacity={0.18}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
