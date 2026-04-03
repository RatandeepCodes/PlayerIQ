import { motion } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getHomeMatchFeed, getMatchAnalysis, getMatches, getPlayerProfile, getPlayers } from "@/api/client.js";
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
import type {
  ApiDirectoryPlayer,
  ApiHomeMatchFeedResponse,
  ApiLiveFeedMatch,
  ApiMatchAnalysisResponse,
  ApiMatchDirectoryEntry,
  ApiPlayerProfile,
} from "@/types/api";

const editorialCards = [
  {
    title: "The Mbappe Effect",
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

const isIndianUpcomingCompetition = (competition?: string) => (competition || "").trim().toLowerCase().includes("indian super");
const fallbackPlayerNameSet = new Set(fallbackPlayers.map((player) => player.name.trim().toLowerCase()));
const isRenderablePlayer = (player: ApiDirectoryPlayer) =>
  Boolean(player.hasAnalytics) || fallbackPlayerNameSet.has((player.name || "").trim().toLowerCase());
const pickBalancedMatches = (matches: ApiMatchDirectoryEntry[], limit: number) => {
  const selected: ApiMatchDirectoryEntry[] = [];
  const seenTeams = new Set<string>();

  for (const match of matches) {
    const teams = match.teams || [];
    const hasSeenTeam = teams.some((team) => seenTeams.has(team));

    if (!hasSeenTeam) {
      selected.push(match);
      teams.forEach((team) => seenTeams.add(team));
    }

    if (selected.length >= limit) {
      return selected;
    }
  }

  for (const match of matches) {
    if (!selected.includes(match)) {
      selected.push(match);
    }

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
};

const buildMatchCard = (
  liveMatch: ApiMatchDirectoryEntry,
  fallbackMatch: Match | undefined,
  analysis: ApiMatchAnalysisResponse | null = null,
): Match => {
  const fallback = fallbackMatch || fallbackMatches[0];
  const liveTeams = analysis?.overview?.teams?.length ? analysis.overview.teams : liveMatch.teams || [];

  return {
    ...fallback,
    id: liveMatch.matchId || fallback.id,
    homeTeam: liveTeams[0] || fallback.homeTeam,
    awayTeam: liveTeams[1] || fallback.awayTeam,
    homeScore: liveMatch.status === "completed" ? Number(liveMatch.homeScore ?? fallback.homeScore) : 0,
    awayScore: liveMatch.status === "completed" ? Number(liveMatch.awayScore ?? fallback.awayScore) : 0,
    competition: liveMatch.competition || fallback.competition,
    date: liveMatch.season || fallback.date,
    venue: liveMatch.status === "completed" ? fallback.venue : "Upcoming fixture",
    status: liveMatch.status || fallback.status,
  };
};

const buildPlayerCard = (
  livePlayer: ApiDirectoryPlayer,
  profile: ApiPlayerProfile | null,
  fallbackPlayer: Player | undefined,
): Player => {
  const matchedFallback =
    fallbackPlayers.find((candidate) => candidate.name.toLowerCase() === String(livePlayer.name || "").toLowerCase()) ||
    fallbackPlayer ||
    fallbackPlayers[0];
  const fallback = matchedFallback;
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
    strengths:
      profile?.analytics?.report?.strengths?.length
        ? profile.analytics.report.strengths
        : fallback.strengths,
    growthAreas:
      profile?.analytics?.report?.developmentAreas?.length
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

const formatHomeMatchDate = (value?: string) => {
  if (!value) {
    return "Date pending";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const buildLiveFeedMatch = (liveMatch: ApiLiveFeedMatch | null | undefined, fallbackMatch: Match): Match | null => {
  if (!liveMatch) {
    return null;
  }

  return {
    ...fallbackMatch,
    id: liveMatch.id || fallbackMatch.id,
    homeTeam: liveMatch.homeTeam || fallbackMatch.homeTeam,
    awayTeam: liveMatch.awayTeam || fallbackMatch.awayTeam,
    homeScore: Number(liveMatch.homeScore ?? fallbackMatch.homeScore),
    awayScore: Number(liveMatch.awayScore ?? fallbackMatch.awayScore),
    competition: liveMatch.competition || fallbackMatch.competition,
    date: formatHomeMatchDate(liveMatch.date),
    venue: liveMatch.venue || fallbackMatch.venue,
    status: liveMatch.status || fallbackMatch.status,
  };
};

const selectSpotlightDirectory = <T extends { playerId: string }>(players: T[], limit: number) => {
  const deduped = [...new Map(players.map((player) => [player.playerId, player])).values()];
  const preferredIds = new Set(fallbackSpotlightPlayers.map((player) => player.id));
  const preferred = deduped.filter((player) => preferredIds.has(player.playerId));
  const remainder = deduped.filter((player) => !preferredIds.has(player.playerId));
  return [...preferred, ...remainder].slice(0, limit);
};

const Home = () => {
  const [homeMatches, setHomeMatches] = useState<Match[]>(fallbackMatches);
  const [spotlightPlayers, setSpotlightPlayers] = useState<Player[]>(fallbackSpotlightPlayers);
  const [recentMatch, setRecentMatch] = useState<Match | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [heroMatchId, setHeroMatchId] = useState<string>(fallbackMatches[0].id);
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      const [matchesResult, playersResult, liveFeedResult] = await Promise.allSettled([
        getMatches(),
        getPlayers({ limit: 500 }),
        getHomeMatchFeed(),
      ]);

      const liveMatches =
        matchesResult.status === "fulfilled" ? ((matchesResult.value.matches || []) as ApiMatchDirectoryEntry[]) : [];
      const playerDirectory =
        playersResult.status === "fulfilled" ? ((playersResult.value.players || []) as ApiDirectoryPlayer[]) : [];
      const livePlayers = selectSpotlightDirectory(
        playerDirectory.filter(isRenderablePlayer),
        fallbackSpotlightPlayers.length,
      );
      const homeFeed =
        liveFeedResult.status === "fulfilled" ? (liveFeedResult.value as ApiHomeMatchFeedResponse) : null;

      let featuredAnalysis: ApiMatchAnalysisResponse | null = null;
      if (liveMatches[0]?.matchId) {
        try {
          featuredAnalysis = (await getMatchAnalysis(liveMatches[0].matchId)) as ApiMatchAnalysisResponse;
        } catch (_error) {
          featuredAnalysis = null;
        }
      }

      let liveSpotlightProfiles: Array<ApiPlayerProfile | null> = [];
      if (livePlayers.length) {
        const profileResults = await Promise.allSettled(
          livePlayers.slice(0, 6).map((player) => getPlayerProfile(player.playerId)),
        );
        liveSpotlightProfiles = profileResults.map((result) =>
          result.status === "fulfilled" ? (result.value as ApiPlayerProfile) : null,
        );
      }

      if (!active) {
        return;
      }

      const completedMatches = liveMatches.filter((match) => match.status === "completed");
      const upcomingIndianMatches = liveMatches.filter(
        (match) => match.status === "upcoming" && isIndianUpcomingCompetition(match.competition),
      );

      const mappedMatches = completedMatches.length
        ? completedMatches
            .slice(0, 6)
            .map((match, index) => buildMatchCard(match, fallbackMatches[index], index === 0 ? featuredAnalysis : null))
        : fallbackMatches;

      const mappedPlayers = livePlayers.length
        ? livePlayers.map((player, index) => buildPlayerCard(player, liveSpotlightProfiles[index], fallbackSpotlightPlayers[index]))
        : fallbackSpotlightPlayers;

      const mappedRecentMatch = buildLiveFeedMatch(homeFeed?.recentMatch, fallbackMatches[1] || fallbackMatches[0]);
      const mappedUpcomingMatches = upcomingIndianMatches.length
        ? pickBalancedMatches(upcomingIndianMatches, 6)
            .map((match, index) => buildMatchCard(match, fallbackMatches[index + 2] || fallbackMatches[0]))
        : homeFeed?.upcomingMatches?.length
          ? homeFeed.upcomingMatches
              .filter((match) => isIndianUpcomingCompetition(match.competition))
              .slice(0, 3)
              .map((match, index) => buildLiveFeedMatch(match, fallbackMatches[index + 2] || fallbackMatches[0]))
              .filter((match): match is Match => Boolean(match))
          : [];

      setHomeMatches(mappedMatches);
      setSpotlightPlayers(mappedPlayers);
      setRecentMatch(mappedRecentMatch);
      setUpcomingMatches(mappedUpcomingMatches);
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
          value: String(
            matchesResult.status === "fulfilled"
              ? completedMatches.length || fallbackMatches.length
              : fallbackMatches.length,
          ),
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
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
        <SectionHeader title="Recent Match" subtitle="The latest finished match from the live schedule feed" />
        {recentMatch ? (
          <MatchCard match={recentMatch} featured interactive={false} />
        ) : (
          <div className="glass-card rounded-xl p-8 text-center text-sm font-body text-muted-foreground">
            The live schedule feed is unavailable right now, so PlayerIQ is showing the curated match board.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader title="Matches to Watch" subtitle="Recent results from elite competitions" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeMatches.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader title="Upcoming Matches" subtitle="Upcoming fixtures from the live schedule feed" />
        {upcomingMatches.length ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.map((match, index) => (
                <MatchCard key={match.id} match={match} index={index} interactive={false} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/fixtures"
                className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-foreground"
              >
                View all matches <ArrowRight size={14} />
              </Link>
            </div>
          </>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center text-sm font-body text-muted-foreground">
            Upcoming live fixtures will appear here when the schedule feed is available.
          </div>
        )}
      </section>

      <section className="border-y border-border bg-card/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Player Spotlight" subtitle="Elite performers under the microscope" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} index={index} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/players"
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
