export default function AuthShell({ eyebrow, title, subtitle, highlights, children, footer }) {
  return (
    <div className="auth-page">
      <section className="auth-shell">
        <aside className="auth-showcase">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle ? <p className="auth-subcopy">{subtitle}</p> : null}

          {highlights?.length ? (
            <div className="auth-highlights">
              {highlights.map((highlight) => (
                <article key={highlight.label} className="auth-highlight-card">
                  <span className="auth-highlight-label">{highlight.label}</span>
                  <strong>{highlight.value}</strong>
                  {highlight.note ? <small>{highlight.note}</small> : null}
                </article>
              ))}
            </div>
          ) : null}
        </aside>

        <div className="auth-panel-wrap">
          <div className="auth-panel">{children}</div>
          {footer ? <div className="auth-footer-note">{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}
