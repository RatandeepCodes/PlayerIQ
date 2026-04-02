import { motion } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import MatchCard from "@/components/MatchCard";
import Navbar from "@/components/Navbar";
import PlayerCard from "@/components/PlayerCard";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { featuredStats, matches, players } from "@/data/mockData";

const editorialCards = [
  {
    title: "The Mbappé Effect",
    subtitle: "How Kylian is reshaping Madrid's attack.",
    category: "Tactical Analysis",
  },
  {
    title: "Musiala's Rise",
    subtitle: "Germany's brightest talent enters elite territory.",
    category: "Player Focus",
  },
  {
    title: "Champions League Preview",
    subtitle: "Breaking down the biggest nights still to come.",
    category: "Match Preview",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:pb-28 sm:pt-40">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.02] blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
              Premium Football Intelligence
            </p>
            <h1 className="font-display text-5xl leading-none tracking-wider text-gradient sm:text-7xl lg:text-8xl">
              The Beautiful Game.
              <br />
              Decoded.
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-sm font-body text-muted-foreground sm:text-base">
              Match stories, player profiles, and elite football insight in one polished experience.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to={`/player/${players[0].id}`}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-body font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
              >
                Explore Players <ArrowRight size={14} />
              </Link>
              <Link
                to={`/matches/${matches[0].id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-body font-medium text-foreground transition-colors hover:bg-accent"
              >
                Match Day
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:grid-cols-4">
          {featuredStats.map((stat, index) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader title="Featured Match" subtitle="The latest marquee matchup" />
        <MatchCard match={matches[0]} featured />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader title="Matches to Watch" subtitle="Recent results from elite competitions" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Player Spotlight" subtitle="Elite performers under the microscope" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.slice(0, 6).map((player, index) => (
              <PlayerCard key={player.id} player={player} index={index} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to={`/player/${players[0].id}`}
              className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-foreground"
            >
              View all players <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader title="Insights" subtitle="Analysis and stories from the world of football" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {editorialCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card group cursor-pointer rounded-xl p-6 transition-all duration-500 hover:border-foreground/20"
            >
              <div className="mb-4 flex items-center gap-2">
                {index === 0 ? <TrendingUp size={14} className="text-muted-foreground" /> : null}
                {index === 1 ? <Users size={14} className="text-muted-foreground" /> : null}
                {index === 2 ? <Trophy size={14} className="text-muted-foreground" /> : null}
                <span className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">
                  {card.category}
                </span>
              </div>
              <h3 className="mb-2 font-display text-xl tracking-wide text-foreground">{card.title}</h3>
              <p className="text-sm font-body text-muted-foreground">{card.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
