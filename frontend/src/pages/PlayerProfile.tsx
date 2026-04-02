import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Shield, Target, Zap } from "lucide-react";

import Footer from "@/components/Footer";
import FormChart from "@/components/FormChart";
import Navbar from "@/components/Navbar";
import RadarChartComponent from "@/components/RadarChart";
import SearchableSelect from "@/components/SearchableSelect";
import SectionHeader from "@/components/SectionHeader";
import { players } from "@/data/mockData";

const defaultPlayer = players[0];

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const player = useMemo(
    () => players.find((candidate) => candidate.id === id) || defaultPlayer,
    [id],
  );

  const radarData = useMemo(
    () =>
      Object.entries(player.attributes).map(([key, value]) => ({
        attribute: key.charAt(0).toUpperCase() + key.slice(1),
        value,
      })),
    [player],
  );

  const options = useMemo(
    () =>
      players.map((candidate) => ({
        value: candidate.id,
        label: candidate.name,
        subtitle: `${candidate.club} · ${candidate.position}`,
      })),
    [],
  );

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="max-w-xs">
          <SearchableSelect
            options={options}
            value={player.id}
            onChange={(nextId) => navigate(`/player/${nextId}`)}
            placeholder="Search players..."
          />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8 sm:p-12"
        >
          <div className="flex flex-col items-start gap-8 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-accent sm:h-32 sm:w-32">
              <span className="font-display text-4xl text-foreground sm:text-5xl">{player.rating}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl tracking-wider text-foreground sm:text-5xl">{player.name}</h1>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="text-sm font-body text-muted-foreground">{player.club}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-body text-muted-foreground">{player.position}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-body text-muted-foreground">{player.nationality}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-body text-muted-foreground">Age {player.age}</span>
              </div>
              <p className="mt-4 max-w-xl text-sm font-body text-muted-foreground">{player.summary}</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-xl p-6">
            <SectionHeader title="Attributes" className="mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(player.attributes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-body capitalize text-muted-foreground">{key}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-foreground"
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-body text-foreground">{value}</span>
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass-card rounded-xl p-6">
          <SectionHeader title="Recent Form" className="mb-4" />
          <FormChart data={player.recentForm} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Brain size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg tracking-wide text-foreground">Playstyle</h3>
            </div>
            <p className="text-sm font-body text-muted-foreground">{player.playstyle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Zap size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg tracking-wide text-foreground">Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.strengths.map((strength) => (
                <span
                  key={strength}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-body text-secondary-foreground"
                >
                  {strength}
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
            <div className="mb-4 flex items-center gap-2">
              <Target size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg tracking-wide text-foreground">Growth Areas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.growthAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-body text-secondary-foreground"
                >
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card flex items-center gap-6 rounded-xl p-6"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-accent">
            <Shield size={24} className="text-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg tracking-wide text-foreground">Pressure Performance</h3>
            <p className="mt-1 text-sm font-body text-muted-foreground">
              Rated <span className="font-medium text-foreground">{player.pressureRating}/100</span> in high-stakes
              matches. {player.pressureRating >= 90 ? "A true big-game player." : "Consistently solid under pressure."}
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default PlayerProfile;
