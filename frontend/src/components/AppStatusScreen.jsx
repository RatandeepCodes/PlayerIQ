export default function AppStatusScreen({
  eyebrow = "PlayerIQ",
  title,
  message,
  tone = "default",
  action,
}) {
  return (
    <section className={`status-screen ${tone === "error" ? "status-screen-error" : ""}`}>
      <div className="status-screen-orb status-screen-orb-a" />
      <div className="status-screen-orb status-screen-orb-b" />
      <div className="status-screen-panel">
        <p className="eyebrow">{eyebrow}</p>
        {title ? <h1>{title}</h1> : null}
        {message ? <p className="status-screen-copy">{message}</p> : null}
        {action ? <div className="status-screen-action">{action}</div> : null}
      </div>
    </section>
  );
}
