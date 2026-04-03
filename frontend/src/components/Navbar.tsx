import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/player", label: "Player Profile" },
  { to: "/compare", label: "Compare Players" },
  { to: "/fixtures", label: "Match Day" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const isActiveLink = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass fixed left-0 right-0 top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-widest text-foreground">
            PlayerIQ
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative rounded-full px-4 py-2 text-sm font-body font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-foreground text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="ml-4 flex items-center gap-3">
                <span className="hidden text-xs font-body uppercase tracking-[0.2em] text-muted-foreground lg:block">
                  {user?.name || "Analyst"}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-border px-5 py-2 text-sm font-body font-medium text-foreground transition-all duration-300 hover:bg-accent"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 rounded-full border border-border px-5 py-2 text-sm font-body font-medium text-foreground transition-all duration-300 hover:bg-accent"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="p-2 text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-t border-border md:hidden"
        >
          <div className="space-y-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-body text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="mt-2 block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-body text-foreground transition-colors hover:bg-accent"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-lg border border-border px-4 py-2 text-center text-sm font-body text-foreground transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      ) : null}
    </motion.nav>
  );
};

export default Navbar;
