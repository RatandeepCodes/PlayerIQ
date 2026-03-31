import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useBackendHealth } from "../hooks/useBackendHealth.js";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Player Profile", to: "/player/P101" },
  { label: "Comparison", to: "/compare" },
  { label: "Match Analysis", to: "/matches/SB-1001" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const backendHealth = useBackendHealth(true);
  const pageTitle =
    navItems.find((item) => location.pathname.startsWith(item.to.split("/:")[0]))?.label || "Workspace";

  return (
    <div className="shell">
      <div className="shell-ambient shell-ambient-a" />
      <div className="shell-ambient shell-ambient-b" />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <p className="eyebrow">Football Intelligence</p>
          <h1>PlayerIQ</h1>
          <p className="sidebar-copy">
            AI-driven player intelligence for scouting, coaching, and live match analysis.
          </p>
        </div>

        <nav className="nav">
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

        <button
          className="sidebar-logout"
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Sign out
        </button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PlayerIQ Workspace</p>
            <h2>{pageTitle}</h2>
            <p className="topbar-copy">Production-ready analyst shell with protected routing, auth state, and backend health awareness.</p>
          </div>
          <div className="topbar-meta">
            <span className="pill user-pill">{user?.name || "Analyst"}</span>
            <span className="pill">Protected Workspace</span>
            <span className={`pill status-pill ${backendHealth.status}`}>{backendHealth.message}</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
