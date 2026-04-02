import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";

import Footer from "@/components/Footer";
import MomentumChart from "@/components/MomentumChart";
import Navbar from "@/components/Navbar";
import SearchableSelect from "@/components/SearchableSelect";
import SectionHeader from "@/components/SectionHeader";
import { matches } from "@/data/mockData";

const defaultMatch = matches[0];

const MatchAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const match = useMemo(
    () => matches.find((candidate) => candidate.id === id) || defaultMatch,
    [id],
  );

  const options = useMemo(
    () =>
      matches.map((candidate) => ({
        value: candidate.id,
        label: `${candidate.homeTeam} vs ${candidate.awayTeam}`,
        subtitle: candidate.competition,
      })),
    [],
  );

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-sm">
          <SearchableSelect
            options={options}
            value={match.id}
            onChange={(nextId) => navigate(`/matches/${nextId}`)}
            placeholder="Select a match..."
          />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8 text-center sm:p-12"
        >
          <p className="mb-6 text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground">
            {match.competition}
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="flex-1 text-right">
              <h2 className="font-display text-3xl tracking-wider text-foreground sm:text-5xl">{match.homeTeam}</h2>
            </div>
            <div className="flex items-center gap-3 font-display text-4xl text-foreground sm:text-6xl">
              <span>{match.homeScore}</span>
              <span className="text-2xl text-muted-foreground">—</span>
              <span>{match.awayScore}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl tracking-wider text-foreground sm:text-5xl">{match.awayTeam}</h2>
            </div>
          </div>
          <p className="mt-4 text-xs font-body text-muted-foreground">
            {match.venue} · {match.date}
          </p>
        </motion.div>
      </section>

      {match.momentum ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="glass-card rounded-xl p-6">
            <SectionHeader title="Match Momentum" />
            <MomentumChart data={match.momentum} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
          </div>
        </section>
      ) : null}

      {match.turningPoints ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionHeader title="Turning Points" />
          <div className="space-y-3">
            {match.turningPoints.map((turningPoint, index) => (
              <motion.div
                key={`${turningPoint.minute}-${index}`}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-card flex items-start gap-4 rounded-lg p-4"
              >
                <div className="flex shrink-0 items-center gap-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="font-display text-sm text-foreground">{turningPoint.minute}'</span>
                </div>
                <div>
                  <span className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">
                    {turningPoint.event}
                  </span>
                  <p className="mt-0.5 text-sm font-body text-foreground">{turningPoint.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {match.phases ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionHeader title="Match Phases" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {match.phases.map((phase, index) => (
              <motion.div
                key={`${phase.title}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Zap size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">
                    {phase.minutes}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-lg tracking-wide text-foreground">{phase.title}</h3>
                <p className="text-sm font-body text-muted-foreground">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {match.stats ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SectionHeader title="Match Stats" />
          <div className="space-y-3">
            {match.stats.map((stat) => {
              const total = stat.home + stat.away;
              const homePct = total > 0 ? (stat.home / total) * 100 : 50;

              return (
                <div key={stat.label} className="glass-card rounded-lg p-4">
                  <div className="mb-2 grid grid-cols-3 items-center text-center">
                    <span className="font-display text-lg text-foreground">{stat.home}</span>
                    <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="font-display text-lg text-foreground">{stat.away}</span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="rounded-full bg-foreground transition-all duration-700"
                      style={{ width: `${homePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
};

export default MatchAnalysis;
