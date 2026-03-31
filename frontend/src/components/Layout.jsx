import { NavLink, Outlet } from "react-router-dom";

import { SHOWCASE_MATCH, SHOWCASE_PLAYERS } from "../config/showcase.js";

const navItems = [
  { label: "Home", to: "/dashboard" },
  { label: "Player Profile", to: `/player/${SHOWCASE_PLAYERS.featured.id}` },
  { label: "Compare Players", to: "/compare" },
  { label: "Match Day", to: `/matches/${SHOWCASE_MATCH.id}` },
];

export default function Layout() {
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
        <Outlet />
      </main>
    </div>
  );
}
