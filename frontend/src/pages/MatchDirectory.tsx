import { motion } from "framer-motion";
import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMatches } from "@/api/client.js";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import type { ApiMatchDirectoryEntry, ApiMatchesResponse } from "@/types/api";

const PAGE_SIZE = 24;

const MatchDirectory = () => {
  const [matches, setMatches] = useState<ApiMatchDirectoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "completed" | "upcoming" | "live">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status]);

  useEffect(() => {
    let active = true;

    const loadMatches = async () => {
      try {
        const response = (await getMatches({
          limit: PAGE_SIZE,
          page,
          search: deferredSearch.trim(),
          status,
        })) as ApiMatchesResponse;

        if (!active) {
          return;
        }

        setMatches(response.matches || []);
        setTotalPages(response.metadata?.totalPages || 1);
        setTotalMatches(response.metadata?.total || 0);
      } catch (_error) {
        if (!active) {
          return;
        }

        setMatches([]);
        setTotalPages(1);
        setTotalMatches(0);
      }
    };

    loadMatches();

    return () => {
      active = false;
    };
  }, [deferredSearch, page, status]);

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <SectionHeader title="Match Directory" subtitle="Browse every match available in the project." />

        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-xl tracking-wide text-foreground">Full match list</h3>
              <p className="mt-1 text-sm font-body text-muted-foreground">{totalMatches} matches found</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search teams, competition, or season"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/20 sm:w-80"
              />
              <div className="flex items-center gap-2">
                {[
                  { value: "all", label: "All Matches" },
                  { value: "live", label: "Live" },
                  { value: "completed", label: "Completed" },
                  { value: "upcoming", label: "Upcoming" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value as "all" | "completed" | "upcoming" | "live")}
                    className={`rounded-full px-4 py-2 text-sm font-body transition-colors ${
                      status === option.value
                        ? "bg-foreground text-primary-foreground"
                        : "border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match, index) => {
            const title = match.title || `${match.teams?.[0] || "Home"} vs ${match.teams?.[1] || "Away"}`;
            const statusLabel =
              match.status === "completed" ? "Completed" : match.status === "live" ? "Live" : "Upcoming";
            const scoreline =
              match.status === "completed" || match.status === "live"
                ? `${Number(match.homeScore || 0)} - ${Number(match.awayScore || 0)}`
                : "vs";

            return (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">
                      {match.competition || "Competition"}
                    </p>
                    <h3 className="mt-2 font-display text-xl tracking-wide text-foreground">{title}</h3>
                    <p className="mt-2 text-sm font-body text-muted-foreground">
                      {[match.season, statusLabel].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-body uppercase tracking-widest ${
                      match.status === "completed"
                        ? "bg-foreground text-primary-foreground"
                        : match.status === "live"
                          ? "bg-destructive/15 text-destructive"
                          : "border border-border text-muted-foreground"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="font-display text-2xl tracking-wide text-foreground">{scoreline}</span>
                  {match.status === "completed" ? (
                    <Link
                      to={`/matches/${match.matchId}`}
                      className="rounded-full border border-border px-4 py-2 text-sm font-body text-foreground transition-colors hover:bg-accent"
                    >
                      Open Match Day
                    </Link>
                  ) : match.status === "live" ? (
                    <span className="rounded-full bg-destructive/15 px-4 py-2 text-sm font-body text-destructive">
                      Live score
                    </span>
                  ) : (
                    <span className="rounded-full border border-border px-4 py-2 text-sm font-body text-muted-foreground">
                      Upcoming
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {!matches.length ? (
          <div className="glass-card mt-6 rounded-xl p-8 text-center text-sm font-body text-muted-foreground">
            No matches matched the current search and filter.
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

export default MatchDirectory;
