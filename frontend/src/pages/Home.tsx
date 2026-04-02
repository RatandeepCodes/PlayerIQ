import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import PlayerCard from '@/components/PlayerCard';
import MatchCard from '@/components/MatchCard';
import StatCard from '@/components/StatCard';
import { players, matches, featuredStats } from '@/data/mockData';
import { ArrowRight, TrendingUp, Users, Trophy } from 'lucide-react';

const editorialCards = [
  {
    title: 'The Mbappé Effect',
    subtitle: 'How Kylian is reshaping Madrid\'s attack',
    category: 'Tactical Analysis',
  },
  {
    title: 'Musiala\'s Rise',
    subtitle: 'Germany\'s brightest talent enters elite territory',
    category: 'Player Focus',
  },
  {
    title: 'UCL Semi-Finals Preview',
    subtitle: 'Breaking down the four remaining contenders',
    category: 'Match Preview',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-foreground/[0.02] blur-3xl" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-body text-muted-foreground uppercase tracking-[0.3em] mb-4">
              Premium Football Intelligence
            </p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-gradient tracking-wider leading-none">
              The Beautiful Game.<br />Decoded.
            </h1>
            <p className="mt-6 text-sm sm:text-base text-muted-foreground font-body max-w-lg mx-auto">
              Deep player analysis, match intelligence, and elite scouting insights — built for those who see football differently.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/player"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-primary-foreground text-sm font-body font-medium hover:bg-foreground/90 transition-colors"
              >
                Explore Players <ArrowRight size={14} />
              </Link>
              <Link
                to="/match"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm font-body font-medium hover:bg-accent transition-colors"
              >
                Match Day
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stat Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          {featuredStats.map((stat, i) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Match */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <SectionHeader title="Featured Match" subtitle="The latest marquee matchup" />
        <MatchCard match={matches[0]} featured />
      </section>

      {/* Matches to Watch */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SectionHeader title="Matches to Watch" subtitle="Recent results from elite competitions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      </section>

      {/* Player Spotlight */}
      <section className="bg-card/30 border-y border-border py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Player Spotlight" subtitle="Elite performers under the microscope" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.slice(0, 6).map((player, i) => (
              <PlayerCard key={player.id} player={player} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/player"
              className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              View all players <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <SectionHeader title="Insights" subtitle="Analysis and stories from the world of football" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {editorialCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 group hover:border-foreground/20 transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-4">
                {i === 0 && <TrendingUp size={14} className="text-muted-foreground" />}
                {i === 1 && <Users size={14} className="text-muted-foreground" />}
                {i === 2 && <Trophy size={14} className="text-muted-foreground" />}
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                  {card.category}
                </span>
              </div>
              <h3 className="font-display text-xl text-foreground tracking-wide mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{card.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
