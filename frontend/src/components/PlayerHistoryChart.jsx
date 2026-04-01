import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatSnapshotLabel = (snapshot, index) => {
  if (!snapshot?.capturedAt) {
    return `View ${index + 1}`;
  }

  const date = new Date(snapshot.capturedAt);
  if (Number.isNaN(date.getTime())) {
    return `View ${index + 1}`;
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

export default function PlayerHistoryChart({ history }) {
  const snapshots = history?.snapshots || [];
  const chartData = snapshots.map((snapshot, index) => ({
    label: formatSnapshotLabel(snapshot, index),
    overallRating: snapshot.overallRating,
    ppi: snapshot.ppi,
    pressureIndex: snapshot.pressureIndex,
  }));

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Recent Form</p>
          <h2>Snapshot trend</h2>
        </div>
      </div>

      {chartData.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#d8d0b7", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#bfb59a", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "rgba(12, 14, 11, 0.96)",
                border: "1px solid rgba(247, 197, 52, 0.18)",
                borderRadius: "16px",
                color: "#f7edd0",
              }}
            />
            <Line type="monotone" dataKey="overallRating" stroke="#f7c534" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="ppi" stroke="#8fd67a" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="pressureIndex" stroke="#f1ede0" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="profile-history-empty">
          <p className="summary-copy">
            No stored profile snapshots yet. Once this player is reviewed across sessions, their recent form line will
            appear here.
          </p>
        </div>
      )}
    </section>
  );
}
