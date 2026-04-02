import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import SearchableSelect from '@/components/SearchableSelect';
import RadarChartComponent from '@/components/RadarChart';
import { players } from '@/data/mockData';

const ComparePlayers = () => {
  const [leftId, setLeftId] = useState(players[0].id);
  const [rightId, setRightId] = useState(players[2].id);

  const leftPlayer = useMemo(() => players.find((p) => p.id === leftId)!, [leftId]);
  const rightPlayer = useMemo(() => players.find((p) => p.id === rightId)!, [rightId]);

  const options = players.map((p) => ({
    value: p.id,
    label: p.name,
    subtitle: `${p.club} · ${p.position}`,
  }));

  const attrs = Object.keys(leftPlayer.attributes) as (keyof typeof leftPlayer.attributes)[];

  const radarData = attrs.map((key) => ({
    attribute: key.charAt(0).toUpperCase() + key.slice(1),
    value: leftPlayer.attributes[key],
  }));

  const secondaryRadar = attrs.map((key) => ({
    attribute: key.charAt(0).toUpperCase() + key.slice(1),
    value: rightPlayer.attributes[key],
  }));

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <SectionHeader
          title="Compare Players"
          subtitle="Head-to-head analysis of elite talent"
        />
      </div>

      {/* Selectors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <SearchableSelect options={options} value={leftId} onChange={setLeftId} placeholder="Select first player..." />
          <SearchableSelect options={options} value={rightId} onChange={setRightId} placeholder="Select second player..." />
        </div>
      </section>

      {/* Player Cards Side by Side */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[leftPlayer, rightPlayer].map((player, idx) => (
            <motion.div
              key={player.id + idx}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-xl p-6 sm:p-8 text-center"
            >
              <div className="w-20 h-20 rounded-xl bg-accent mx-auto flex items-center justify-center mb-4">
                <span className="font-display text-3xl text-foreground">{player.rating}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wider">{player.name}</h2>
              <p className="text-sm text-muted-foreground font-body mt-1">{player.club} · {player.position}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {player.strengths.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] font-body px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Center Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-block glass-card rounded-xl px-8 py-4"
        >
          <span className="font-display text-xl text-foreground tracking-wider">
            {leftPlayer.rating > rightPlayer.rating
              ? `${leftPlayer.name} leads by ${leftPlayer.rating - rightPlayer.rating} points`
              : leftPlayer.rating < rightPlayer.rating
              ? `${rightPlayer.name} leads by ${rightPlayer.rating - leftPlayer.rating} points`
              : 'Dead even on overall rating'}
          </span>
        </motion.div>
      </section>

      {/* Radar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass-card rounded-xl p-6 max-w-xl mx-auto">
          <SectionHeader title="Attribute Radar" className="mb-2 text-center" />
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-foreground" />
              <span className="text-xs font-body text-muted-foreground">{leftPlayer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-muted-foreground border-dashed" style={{ borderTop: '1px dashed' }} />
              <span className="text-xs font-body text-muted-foreground">{rightPlayer.name}</span>
            </div>
          </div>
          <RadarChartComponent data={radarData} secondaryData={secondaryRadar} />
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SectionHeader title="Attribute Breakdown" />
        <div className="space-y-3">
          {attrs.map((attr) => {
            const lv = leftPlayer.attributes[attr];
            const rv = rightPlayer.attributes[attr];
            const winner = lv > rv ? 'left' : rv > lv ? 'right' : 'tie';

            return (
              <motion.div
                key={attr}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-lg p-4 grid grid-cols-3 items-center text-center"
              >
                <span className={`font-display text-xl tracking-wide ${winner === 'left' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {lv}
                </span>
                <span className="text-xs font-body text-muted-foreground uppercase tracking-widest capitalize">
                  {attr}
                </span>
                <span className={`font-display text-xl tracking-wide ${winner === 'right' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {rv}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Category Winners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SectionHeader title="Category Winners" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {attrs.map((attr) => {
            const lv = leftPlayer.attributes[attr];
            const rv = rightPlayer.attributes[attr];
            const winnerName = lv > rv ? leftPlayer.name : rv > lv ? rightPlayer.name : 'Tie';

            return (
              <div key={attr} className="glass-card rounded-xl p-4 text-center">
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-widest mb-1 capitalize">{attr}</p>
                <p className="font-display text-sm text-foreground tracking-wide">{winnerName}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComparePlayers;
