import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import SearchableSelect from '@/components/SearchableSelect';
import RadarChartComponent from '@/components/RadarChart';
import FormChart from '@/components/FormChart';
import { players } from '@/data/mockData';
import { Shield, Zap, Target, Brain } from 'lucide-react';

const PlayerProfile = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || players[0].id;
  const [selectedId, setSelectedId] = useState(initialId);

  const player = useMemo(() => players.find((p) => p.id === selectedId) || players[0], [selectedId]);

  const radarData = Object.entries(player.attributes).map(([key, value]) => ({
    attribute: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  const options = players.map((p) => ({
    value: p.id,
    label: p.name,
    subtitle: `${p.club} · ${p.position}`,
  }));

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="max-w-xs">
          <SearchableSelect
            options={options}
            value={selectedId}
            onChange={setSelectedId}
            placeholder="Search players..."
          />
        </div>
      </div>

      {/* Hero Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8 sm:p-12"
        >
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-accent flex items-center justify-center shrink-0">
              <span className="font-display text-4xl sm:text-5xl text-foreground">{player.rating}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-wider">{player.name}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-sm font-body text-muted-foreground">{player.club}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-body text-muted-foreground">{player.position}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-body text-muted-foreground">{player.nationality}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-body text-muted-foreground">Age {player.age}</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground font-body max-w-xl">{player.summary}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Attributes + Radar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <SectionHeader title="Attributes" className="mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(player.attributes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground capitalize">{key}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-foreground"
                      />
                    </div>
                    <span className="text-sm font-body text-foreground w-8 text-right">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <SectionHeader title="Radar" className="mb-4" />
            <RadarChartComponent data={radarData} />
          </div>
        </div>
      </section>

      {/* Recent Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass-card rounded-xl p-6">
          <SectionHeader title="Recent Form" className="mb-4" />
          <FormChart data={player.recentForm} />
        </div>
      </section>

      {/* Playstyle + Strengths */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg text-foreground tracking-wide">Playstyle</h3>
            </div>
            <p className="text-sm text-muted-foreground font-body">{player.playstyle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg text-foreground tracking-wide">Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.strengths.map((s) => (
                <span key={s} className="text-xs font-body px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg text-foreground tracking-wide">Growth Areas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.growthAreas.map((g) => (
                <span key={g} className="text-xs font-body px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
                  {g}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pressure Performance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-6 flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Shield size={24} className="text-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground tracking-wide">Pressure Performance</h3>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Rated <span className="text-foreground font-medium">{player.pressureRating}/100</span> in high-stakes matches. {player.pressureRating >= 90 ? 'A true big-game player.' : 'Consistently solid under pressure.'}
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default PlayerProfile;
