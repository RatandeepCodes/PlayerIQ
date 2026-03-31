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
  { metric: "Finishing", playerOne: 84, playerTwo: 81 },
  { metric: "Passing", playerOne: 77, playerTwo: 79 },
  { metric: "Movement", playerOne: 76, playerTwo: 88 },
  { metric: "Work Rate", playerOne: 71, playerTwo: 74 },
  { metric: "Chance Threat", playerOne: 82, playerTwo: 85 },
  { metric: "Big Match Feel", playerOne: 90, playerTwo: 79 },
];

export default function ComparisonRadar() {
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
            name={SHOWCASE_PLAYERS.compareA.name}
            dataKey="playerOne"
            stroke="#d7b26d"
            fill="#d7b26d"
            fillOpacity={0.22}
          />
          <Radar
            name={SHOWCASE_PLAYERS.compareB.name}
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
