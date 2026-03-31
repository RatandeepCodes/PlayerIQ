import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useBackendHealth } from "../hooks/useBackendHealth.js";

const navItems = [
  { label: "Home", to: "/dashboard" },
  { label: "Player Profile", to: `/player/${SHOWCASE_PLAYERS.featured.id}` },
  { label: "Compare Players", to: "/compare" },
  { label: "Match Day", to: `/matches/${SHOWCASE_MATCH.id}` },
];

const getServiceMessage = (status) => {
  if (status === "online") {
    return "Live data ready";
  }

  if (status === "degraded" || status === "checking") {
    return "Updating live feed";
  }

  return "Offline mode";
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const backendHealth = useBackendHealth(true);
  const pageTitle =
    navItems.find((item) => location.pathname.startsWith(item.to.split("/:")[0]))?.label || "PlayerIQ";

  return (
    <div className="shell">
      <header className="site-header">
        <div className="site-header-row">
          <div className="brand-block">
            <p className="eyebrow">For Fans And Analysts</p>
            <h1>PlayerIQ</h1>
            <p className="brand-copy">
              Follow the players you love, track match stories as they unfold, and understand performances in a way that feels made for football.
            </p>
          </div>

          <div className="header-highlight">
            <span className="header-highlight-label">Featured Now</span>
            <strong>{SHOWCASE_PLAYERS.featured.name}</strong>
            <small>{SHOWCASE_PLAYERS.featured.team}</small>
          </div>
        </div>

        <nav className="top-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PlayerIQ</p>
            <h2>{pageTitle}</h2>
            <p className="topbar-copy">A football-first view of form, match flow, and standout moments.</p>
          </div>
          <div className="topbar-meta">
            <span className="pill user-pill">{user?.name || "Football Fan"}</span>
            <span className={`pill status-pill ${backendHealth.status}`}>{getServiceMessage(backendHealth.status)}</span>
            <button
              className="topbar-action"
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Sign Out
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
