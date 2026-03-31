import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { SHOWCASE_MATCH } from "../config/showcase.js";

const data = [
  { minute: 5, intensity: 24 },
  { minute: 15, intensity: 48 },
  { minute: 30, intensity: 34 },
  { minute: 41, intensity: 61 },
  { minute: 58, intensity: 50 },
  { minute: 76, intensity: 83 },
  { minute: 89, intensity: 68 },
];

export default function MomentumChart() {
  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Match Flow</p>
          <h2>How the game moved</h2>
          <p className="summary-copy">{SHOWCASE_MATCH.title}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d7b26d" stopOpacity={0.78} />
              <stop offset="95%" stopColor="#d7b26d" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(244, 226, 187, 0.08)" vertical={false} />
          <XAxis dataKey="minute" tick={{ fill: "#eadfbe" }} />
          <YAxis tick={{ fill: "#eadfbe" }} />
          <Tooltip />
          <Area type="monotone" dataKey="intensity" stroke="#d7b26d" fill="url(#momentumFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
