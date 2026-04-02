import { motion } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getMatchAnalysis, getMatches, getPlayerProfile, getPlayers } from "@/api/client.js";
import Footer from "@/components/Footer";
import MatchCard from "@/components/MatchCard";
import Navbar from "@/components/Navbar";
import PlayerCard from "@/components/PlayerCard.tsx";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import {
  featuredStats as fallbackStats,
  matches as fallbackMatches,
  players as fallbackPlayers,
  spotlightPlayers as fallbackSpotlightPlayers,
  type Match,
  type Player,
} from "@/data/mockData";

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

const buildMatchCard = (
  liveMatch: {
    matchId: string;
    title?: string;
    teams?: string[];
    competition?: string;
  },
  fallbackMatch: Match | undefined,
  analysis: {
    overview?: {
      teams?: string[];
    };
  } | null = null,
): Match => {
  const fallback = fallbackMatch || fallbackMatches[0];
  const liveTeams = analysis?.overview?.teams?.length ? analysis.overview.teams : liveMatch.teams || [];

  return {
    ...fallback,
    id: liveMatch.matchId || fallback.id,
    homeTeam: liveTeams[0] || fallback.homeTeam,
    awayTeam: liveTeams[1] || fallback.awayTeam,
    competition: liveMatch.competition || fallback.competition,
  };
};

const buildPlayerCard = (
  livePlayer: {
    playerId: string;
    name?: string;
    team?: string;
    position?: string;
    nationality?: string;
  },
  profile: any,
  fallbackPlayer: Player | undefined,
): Player => {
  const fallback = fallbackPlayer || fallbackPlayers[0];
  const analyticsAttributes = profile?.analytics?.attributes || {};

  return {
    ...fallback,
    id: livePlayer.playerId || fallback.id,
    name: livePlayer.name || fallback.name,
    club: livePlayer.team || fallback.club,
    position: livePlayer.position || fallback.position,
    nationality: livePlayer.nationality || fallback.nationality,
    rating: profile?.overview?.overallRating ?? fallback.rating,
    summary: profile?.overview?.reportSummary || fallback.summary,
    playstyle: profile?.overview?.playstyle || fallback.playstyle,
    pressureRating:
      profile?.overview?.pressureIndex !== null && profile?.overview?.pressureIndex !== undefined
        ? Math.round(Number(profile.overview.pressureIndex) * 100)
        : fallback.pressureRating,
    strengths: profile?.analytics?.report?.strengths?.length
      ? profile.analytics.report.strengths
      : fallback.strengths,
    growthAreas: profile?.analytics?.report?.developmentAreas?.length
      ? profile.analytics.report.developmentAreas
      : fallback.growthAreas,
    attributes: {
      pace: fallback.attributes.pace,
      shooting: analyticsAttributes.shooting ?? fallback.attributes.shooting,
      passing: analyticsAttributes.passing ?? fallback.attributes.passing,
      dribbling: analyticsAttributes.dribbling ?? fallback.attributes.dribbling,
      defending: analyticsAttributes.defending ?? fallback.attributes.defending,
      physical: analyticsAttributes.physical ?? fallback.attributes.physical,
    },
  };
};

const isIndianPlayer = (player: { nationality?: string } | null | undefined) =>
  String(player?.nationality || "").trim().toLowerCase() === "india";

const selectSpotlightDirectory = <
  T extends {
    playerId: string;
    nationality?: string;
  },
>(
  players: T[],
  limit: number,
) => {
  const uniquePlayers = [...new Map(players.map((player) => [player.playerId, player])).values()];
  const indianPlayers = uniquePlayers.filter((player) => isIndianPlayer(player));
  const foreignPlayers = uniquePlayers.filter((player) => !isIndianPlayer(player));

  if (!indianPlayers.length || !foreignPlayers.length) {
    return uniquePlayers.slice(0, limit);
  }

  const spotlightSelection: T[] = [];
  const preferredIndianCount = Math.min(Math.ceil(limit / 2), indianPlayers.length);
  const preferredForeignCount = Math.min(Math.floor(limit / 2), foreignPlayers.length);

  for (let index = 0; index < Math.max(preferredIndianCount, preferredForeignCount); index += 1) {
    if (indianPlayers[index] && spotlightSelection.length < limit) {
      spotlightSelection.push(indianPlayers[index]);
    }

    if (foreignPlayers[index] && spotlightSelection.length < limit) {
      spotlightSelection.push(foreignPlayers[index]);
    }
  }

  const selectedIds = new Set(spotlightSelection.map((player) => player.playerId));
  const remainingPlayers = uniquePlayers.filter((player) => !selectedIds.has(player.playerId));

  return [...spotlightSelection, ...remainingPlayers].slice(0, limit);
};

const Home = () => {
  const [homeMatches, setHomeMatches] = useState<Match[]>(fallbackMatches);
  const [spotlightPlayers, setSpotlightPlayers] = useState<Player[]>(fallbackSpotlightPlayers);
  const [heroMatchId, setHeroMatchId] = useState<string>(fallbackMatches[0].id);
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      const [matchesResult, playersResult] = await Promise.allSettled([
        getMatches(),
        getPlayers({ limit: 18 }),
      ]);

      const liveMatches = matchesResult.status === "fulfilled" ? matchesResult.value.matches || [] : [];
      const playerDirectory = playersResult.status === "fulfilled" ? playersResult.value.players || [] : [];
      const livePlayers = selectSpotlightDirectory(playerDirectory, fallbackSpotlightPlayers.length);

      let featuredAnalysis = null;
      if (liveMatches[0]?.matchId) {
        try {
          featuredAnalysis = await getMatchAnalysis(liveMatches[0].matchId);
        } catch (_error) {
          featuredAnalysis = null;
        }
      }

      let liveSpotlightProfiles: any[] = [];
      if (livePlayers.length) {
        const profileResults = await Promise.allSettled(
          livePlayers.slice(0, 6).map((player: { playerId: string }) => getPlayerProfile(player.playerId)),
        );
        liveSpotlightProfiles = profileResults.map((result) => (result.status === "fulfilled" ? result.value : null));
      }

      if (!active) {
        return;
      }

      const mappedMatches = liveMatches.length
        ? liveMatches.slice(0, 6).map((match: any, index: number) =>
            buildMatchCard(match, fallbackMatches[index], index === 0 ? featuredAnalysis : null),
          )
        : fallbackMatches;

      const mappedPlayers = livePlayers.length
        ? livePlayers.map((player: any, index: number) =>
            buildPlayerCard(player, liveSpotlightProfiles[index], fallbackSpotlightPlayers[index]),
          )
        : fallbackSpotlightPlayers;

      setHomeMatches(mappedMatches);
      setSpotlightPlayers(mappedPlayers);
      setHeroMatchId(mappedMatches[0]?.id || fallbackMatches[0].id);
      setStats([
        {
          label: "Players Profiled",
          value: String(
            playersResult.status === "fulfilled"
              ? playerDirectory.length || fallbackSpotlightPlayers.length
              : fallbackSpotlightPlayers.length,
          ),
        },
        {
          label: "Matches Available",
          value: String(matchesResult.status === "fulfilled" ? liveMatches.length || fallbackMatches.length : fallbackMatches.length),
        },
        {
          label: "Momentum Windows",
          value: String(featuredAnalysis?.summary?.totalMomentumWindows ?? fallbackStats[2].value),
        },
        {
          label: "Turning Points",
          value: String(featuredAnalysis?.summary?.totalTurningPoints ?? fallbackStats[3].value),
        },
      ]);
    };

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  const featuredMatch = useMemo(() => homeMatches[0] || fallbackMatches[0], [homeMatches]);
  const featuredPlayer = useMemo(() => spotlightPlayers[0] || fallbackSpotlightPlayers[0], [spotlightPlayers]);

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
                to={`/player/${featuredPlayer.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-body font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
              >
                Explore Players <ArrowRight size={14} />
              </Link>
              <Link
                to={`/matches/${heroMatchId}`}
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
          {stats.map((stat, index) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader title="Featured Match" subtitle="The latest marquee matchup" />
        <MatchCard match={featuredMatch} featured />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader title="Matches to Watch" subtitle="Recent results from elite competitions" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeMatches.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Player Spotlight" subtitle="Indian standouts and global stars under the microscope" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} index={index} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to={`/player/${featuredPlayer.id}`}
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
