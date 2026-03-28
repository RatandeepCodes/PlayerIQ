import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Player Profile", to: "/player/10" },
  { label: "Comparison", to: "/compare" },
  { label: "Match Analysis", to: "/matches/1001" },
];

export default function Layout() {
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
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

