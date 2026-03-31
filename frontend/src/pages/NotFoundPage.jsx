import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <section className="panel empty-state">
        <p className="eyebrow">Not Found</p>
        <h2>This page does not exist in PlayerIQ.</h2>
        <p className="summary-copy">
          The route may have changed, or the page may not be wired into the current frontend slice yet.
        </p>
        <div className="action-row">
          <Link className="primary-link" to="/dashboard">
            Go to dashboard
          </Link>
          <Link className="secondary-link" to="/login">
            Go to login
          </Link>
        </div>
      </section>
    </div>
  );
}
