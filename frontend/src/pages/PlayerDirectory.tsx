import { motion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getPlayers } from "@/api/client.js";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import type { ApiDirectoryPlayer, ApiPlayersResponse } from "@/types/api";

const PAGE_SIZE = 24;

const PlayerDirectory = () => {
  const [players, setPlayers] = useState<ApiDirectoryPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [analyticsOnly, setAnalyticsOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = useMemo(() => deferredSearch.trim().replace(/\s+/g, " "), [deferredSearch]);

  useEffect(() => {
    setPage(1);
  }, [analyticsOnly, normalizedSearch]);

  useEffect(() => {
    let active = true;

    const loadPlayers = async () => {
      if (active) {
        setIsLoading(true);
      }

      try {
        const response = (await getPlayers({
          limit: PAGE_SIZE,
          page,
          search: normalizedSearch,
          analyticsOnly,
        })) as ApiPlayersResponse;

        if (!active) {
          return;
        }

        setPlayers(response.players || []);
        setTotalPages(response.metadata?.totalPages || 1);
        setTotalPlayers(response.metadata?.total || 0);
      } catch (_error) {
        if (!active) {
          return;
        }

        setPlayers([]);
        setTotalPages(1);
        setTotalPlayers(0);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadPlayers();

    return () => {
      active = false;
    };
  }, [analyticsOnly, normalizedSearch, page]);

  const heading = useMemo(
    () => (analyticsOnly ? "Analytics-backed players" : "All players in the project"),
    [analyticsOnly],
  );
  const ratedPlayersOnPage = useMemo(() => players.filter((player) => player.hasAnalytics).length, [players]);
  const hasActiveFilters = Boolean(normalizedSearch) || analyticsOnly;

  const resetFilters = () => {
    setSearch("");
    setAnalyticsOnly(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <SectionHeader title="Player Directory" subtitle="Browse the full player list in the project." />

        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-xl tracking-wide text-foreground">{heading}</h3>
              <p className="mt-1 text-sm font-body text-muted-foreground">
                {isLoading ? "Updating player results..." : `${totalPlayers} players found`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search player, club, nationality, or role"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/20 sm:w-80"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnalyticsOnly(false)}
                  className={`rounded-full px-4 py-2 text-sm font-body transition-colors ${
                    !analyticsOnly ? "bg-foreground text-primary-foreground" : "border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  All Players
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsOnly(true)}
                  className={`rounded-full px-4 py-2 text-sm font-body transition-colors ${
                    analyticsOnly ? "bg-foreground text-primary-foreground" : "border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  Analytics-backed only
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-body text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">Showing {players.length} on this page</span>
            <span className="rounded-full border border-border px-3 py-1">{ratedPlayersOnPage} rated profiles visible</span>
            <span className="rounded-full border border-border px-3 py-1">
              {analyticsOnly ? "Filtered to analytics-backed players" : "Mixed directory with rated and directory-only players"}
            </span>
            {normalizedSearch ? (
              <span className="rounded-full border border-border px-3 py-1">Search: "{normalizedSearch}"</span>
            ) : null}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-border px-3 py-1 text-foreground transition-colors hover:bg-accent"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl tracking-wide text-foreground">{player.name}</h3>
                  <p className="mt-1 text-sm font-body text-muted-foreground">
                    {[player.team, player.position, player.nationality].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-body uppercase tracking-widest ${
                    player.hasAnalytics
                      ? "bg-foreground text-primary-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {player.hasAnalytics ? "Live rating" : "Directory"}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-body text-muted-foreground">ID: {player.playerId}</span>
                <Link
                  to={`/player/${player.playerId}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-body text-foreground transition-colors hover:bg-accent"
                >
                  Open profile
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {!players.length ? (
          <div className="glass-card mt-6 rounded-xl p-8 text-center text-sm font-body text-muted-foreground">
            {normalizedSearch || analyticsOnly
              ? "No players matched the current search and filter."
              : "No players are available in the directory right now."}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="rounded-full border border-border px-4 py-2 text-sm font-body text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm font-body text-muted-foreground">
            Page {page} of {Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="rounded-full border border-border px-4 py-2 text-sm font-body text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlayerDirectory;
