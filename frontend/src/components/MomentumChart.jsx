import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { minute: 5, intensity: 20 },
  { minute: 15, intensity: 42 },
  { minute: 30, intensity: 36 },
  { minute: 41, intensity: 62 },
  { minute: 58, intensity: 48 },
  { minute: 76, intensity: 85 },
  { minute: 89, intensity: 71 },
];

export default function MomentumChart() {
  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Live Match Flow</p>
          <h2>Momentum Timeline</h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#88d498" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#88d498" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="minute" tick={{ fill: "#c8d0e0" }} />
          <YAxis tick={{ fill: "#c8d0e0" }} />
          <Tooltip />
          <Area type="monotone" dataKey="intensity" stroke="#88d498" fill="url(#momentumFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

