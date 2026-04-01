import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const buildChartData = (analysis) => {
  const teams = analysis?.overview?.teams || analysis?.teams || [];
  const buckets = analysis?.momentumBuckets || [];

  return buckets.map((bucket) => {
    const scores = Array.isArray(bucket.scores)
      ? Object.fromEntries(bucket.scores.map((entry) => [entry.team, entry.score]))
      : bucket.scores || {};

    return {
      label: bucket.label || `${bucket.bucketStart}'-${bucket.bucketEnd}'`,
      swing: bucket.isSwing ? bucket.swingMagnitude : 0,
      [teams[0] || "Team A"]: scores[teams[0]] ?? 0,
      [teams[1] || "Team B"]: scores[teams[1]] ?? 0,
    };
  });
};

export default function MomentumChart({ analysis, title }) {
  const teams = analysis?.overview?.teams || analysis?.teams || [];
  const chartData = buildChartData(analysis);

  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Match Flow</p>
          <h2>How the game moved</h2>
          <p className="summary-copy">{title}</p>
        </div>
      </div>

      {chartData.length ? (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(244, 226, 187, 0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#eadfbe" }} />
            <YAxis tick={{ fill: "#eadfbe" }} />
            <Tooltip
              contentStyle={{
                background: "rgba(10, 10, 10, 0.96)",
                border: "1px solid rgba(247, 197, 52, 0.16)",
                borderRadius: "16px",
                color: "#f6ecd2",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={teams[0] || "Team A"}
              stroke="#f7c534"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey={teams[1] || "Team B"}
              stroke="#6dc7ff"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-empty-state">
          <p className="summary-copy">Live momentum windows will appear here when the match analysis response loads.</p>
        </div>
      )}
    </div>
  );
}
