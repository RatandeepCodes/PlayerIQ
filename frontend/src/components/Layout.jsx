import { NavLink, Outlet, useLocation } from "react-router-dom";

import { clearStoredToken } from "../auth/session.js";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Player Profile", to: "/player/P101" },
  { label: "Comparison", to: "/compare" },
  { label: "Match Analysis", to: "/matches/SB-1001" },
];

export default function Layout() {
  const location = useLocation();
  const pageTitle =
    navItems.find((item) => location.pathname.startsWith(item.to.split("/:")[0]))?.label || "Workspace";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
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
            clearStoredToken();
            window.location.href = "/login";
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
          </div>
          <div className="topbar-meta">
            <span className="pill">Protected Workspace</span>
            <span className="pill">Frontend Part 1</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
