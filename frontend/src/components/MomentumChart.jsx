import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const buildChartData = (analysis) => {
  const teams = analysis?.teams || [];
  const buckets = analysis?.momentumBuckets || [];

  return buckets.map((bucket) => {
    const scores = Array.isArray(bucket.scores)
      ? Object.fromEntries(bucket.scores.map((entry) => [entry.team, entry.score]))
      : {};

    return {
      label: bucket.label,
      [teams[0] || "Team A"]: scores[teams[0]] ?? 0,
      [teams[1] || "Team B"]: scores[teams[1]] ?? 0,
    };
  });
};

export default function MomentumChart({ analysis, title }) {
  const teams = analysis?.teams || [];
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
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(244, 226, 187, 0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#eadfbe" }} />
            <YAxis tick={{ fill: "#eadfbe" }} />
            <Tooltip
              contentStyle={{
                background: "rgba(17, 20, 16, 0.96)",
                border: "1px solid rgba(244, 226, 187, 0.08)",
                borderRadius: "14px",
                color: "#f6ecd2",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey={teams[0] || "Team A"} stroke="#d7b26d" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey={teams[1] || "Team B"} stroke="#6dc7ff" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="summary-copy">Match flow will appear here when the match data is ready.</p>
      )}
    </div>
  );
}
