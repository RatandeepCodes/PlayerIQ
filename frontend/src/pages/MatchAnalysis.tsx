import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import SearchableSelect from '@/components/SearchableSelect';
import MomentumChart from '@/components/MomentumChart';
import { matches } from '@/data/mockData';
import { Clock, Zap } from 'lucide-react';

const MatchAnalysis = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || matches[0].id;
  const [selectedId, setSelectedId] = useState(initialId);

  const match = useMemo(() => matches.find((m) => m.id === selectedId) || matches[0], [selectedId]);

  const options = matches.map((m) => ({
    value: m.id,
    label: `${m.homeTeam} vs ${m.awayTeam}`,
    subtitle: m.competition,
  }));

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-sm">
          <SearchableSelect options={options} value={selectedId} onChange={setSelectedId} placeholder="Select a match..." />
        </div>
      </div>

      {/* Match Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8 sm:p-12 text-center"
        >
          <p className="text-[10px] font-body text-muted-foreground uppercase tracking-[0.3em] mb-6">
            {match.competition}
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="text-right flex-1">
              <h2 className="font-display text-3xl sm:text-5xl text-foreground tracking-wider">{match.homeTeam}</h2>
            </div>
            <div className="font-display text-4xl sm:text-6xl text-foreground flex items-center gap-3">
              <span>{match.homeScore}</span>
              <span className="text-muted-foreground text-2xl">—</span>
              <span>{match.awayScore}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl sm:text-5xl text-foreground tracking-wider">{match.awayTeam}</h2>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground font-body">
            {match.venue} · {match.date}
          </p>
        </motion.div>
      </section>

      {/* Momentum */}
      {match.momentum && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="glass-card rounded-xl p-6">
            <SectionHeader title="Match Momentum" />
            <MomentumChart data={match.momentum} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
          </div>
        </section>
      )}

      {/* Turning Points */}
      {match.turningPoints && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionHeader title="Turning Points" />
          <div className="space-y-3">
            {match.turningPoints.map((tp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-lg p-4 flex items-start gap-4"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="font-display text-sm text-foreground">{tp.minute}'</span>
                </div>
                <div>
                  <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">{tp.event}</span>
                  <p className="text-sm font-body text-foreground mt-0.5">{tp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Match Phases */}
      {match.phases && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionHeader title="Match Phases" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {match.phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">{phase.minutes}</span>
                </div>
                <h3 className="font-display text-lg text-foreground tracking-wide mb-1">{phase.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      {match.stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SectionHeader title="Match Stats" />
          <div className="space-y-3">
            {match.stats.map((stat) => {
              const total = stat.home + stat.away;
              const homePct = total > 0 ? (stat.home / total) * 100 : 50;

              return (
                <div key={stat.label} className="glass-card rounded-lg p-4">
                  <div className="grid grid-cols-3 items-center text-center mb-2">
                    <span className="font-display text-lg text-foreground">{stat.home}</span>
                    <span className="text-xs font-body text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                    <span className="font-display text-lg text-foreground">{stat.away}</span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary">
                    <div className="bg-foreground rounded-full transition-all duration-700" style={{ width: `${homePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default MatchAnalysis;
