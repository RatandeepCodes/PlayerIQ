export default function AuthShell({ eyebrow, title, subtitle, highlights, children, footer }) {
  return (
    <div className="auth-page">
      <section className="auth-shell">
        <aside className="auth-showcase">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-subcopy">{subtitle}</p>

          <div className="auth-highlights">
            {highlights.map((highlight) => (
              <article key={highlight.label} className="auth-highlight-card">
                <span className="auth-highlight-label">{highlight.label}</span>
                <strong>{highlight.value}</strong>
                <small>{highlight.note}</small>
              </article>
            ))}
          </div>
        </aside>

        <div className="auth-panel-wrap">
          <div className="auth-panel">{children}</div>
          {footer ? <div className="auth-footer-note">{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}
