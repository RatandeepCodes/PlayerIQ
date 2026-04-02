import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export default function PlayerRadarChart({ analytics }) {
  const data = Object.entries(analytics.attributes).map(([metric, value]) => ({
    metric,
    value,
  }));

  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Attributes</p>
          <h2>Radar Profile</h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#f6ecd2", fontSize: 12 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#d7b26d"
            fill="#d7b26d"
            fillOpacity={0.28}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

