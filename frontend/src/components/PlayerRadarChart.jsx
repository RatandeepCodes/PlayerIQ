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
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#d7ddf0", fontSize: 12 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#88d498"
            fill="#88d498"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

