import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { SHOWCASE_PLAYERS } from "../config/showcase.js";

const data = [
  { metric: "Shooting", playerOne: 78, playerTwo: 86 },
  { metric: "Passing", playerOne: 88, playerTwo: 73 },
  { metric: "Dribbling", playerOne: 83, playerTwo: 87 },
  { metric: "Defending", playerOne: 65, playerTwo: 58 },
  { metric: "Creativity", playerOne: 90, playerTwo: 70 },
  { metric: "Physical", playerOne: 74, playerTwo: 79 },
];

export default function ComparisonRadar() {
  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Comparison</p>
          <h2>Radar Analytics</h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#d7ddf0", fontSize: 12 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            name={SHOWCASE_PLAYERS.comparisonA.name}
            dataKey="playerOne"
            stroke="#88d498"
            fill="#88d498"
            fillOpacity={0.2}
          />
          <Radar
            name={SHOWCASE_PLAYERS.comparisonB.name}
            dataKey="playerTwo"
            stroke="#ffb86b"
            fill="#ffb86b"
            fillOpacity={0.2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
