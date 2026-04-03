import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { getPlayerComparison, getPlayerProfile, getPlayers } from "@/api/client.js";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RadarChartComponent from "@/components/RadarChart";
import SearchableSelect from "@/components/SearchableSelect";
import SectionHeader from "@/components/SectionHeader";
import { players as fallbackPlayers, type Player } from "@/data/mockData";
import type { ApiDirectoryPlayer, ApiPlayerComparisonResponse, ApiPlayerProfile } from "@/types/api";

type DisplayPlayer = Player;
type AttributeKey = keyof DisplayPlayer["attributes"];

const defaultLeftPlayer = fallbackPlayers[0];
const defaultRightPlayer = fallbackPlayers[2] || fallbackPlayers[1];
const fallbackPlayerNameSet = new Set(fallbackPlayers.map((player) => player.name.trim().toLowerCase()));
const isRenderablePlayer = (player: ApiDirectoryPlayer) =>
  Boolean(player.hasAnalytics) || fallbackPlayerNameSet.has((player.name || "").trim().toLowerCase());

const mapProfileToPlayer = (
  directoryPlayer: ApiDirectoryPlayer | undefined,
  profile: ApiPlayerProfile | null,
  fallbackPlayer: DisplayPlayer,
): DisplayPlayer => {
  const attributes = profile?.analytics?.attributes || {};

  return {
    ...fallbackPlayer,
    id: profile?.player?.playerId || directoryPlayer?.playerId || fallbackPlayer.id,
    name: profile?.player?.name || directoryPlayer?.name || fallbackPlayer.name,
    club: profile?.player?.team || directoryPlayer?.team || fallbackPlayer.club,
    nationality: profile?.player?.nationality || directoryPlayer?.nationality || fallbackPlayer.nationality,
    position: profile?.player?.position || directoryPlayer?.position || fallbackPlayer.position,
    rating: profile?.overview?.overallRating ?? fallbackPlayer.rating,
    summary: profile?.overview?.reportSummary || fallbackPlayer.summary,
    playstyle: profile?.analytics?.playstyleProfile?.name || profile?.overview?.playstyle || fallbackPlayer.playstyle,
    pressureRating:
      profile?.analytics?.pressure?.pressureScore ??
      (profile?.overview?.pressureIndex !== null && profile?.overview?.pressureIndex !== undefined
        ? Math.round(Number(profile.overview.pressureIndex) * 100)
        : fallbackPlayer.pressureRating),
    strengths:
      profile?.analytics?.report?.strengths?.length
        ? profile.analytics.report.strengths
        : fallbackPlayer.strengths,
    growthAreas:
      profile?.analytics?.report?.developmentAreas?.length
        ? profile.analytics.report.developmentAreas
        : fallbackPlayer.growthAreas,
    attributes: {
      shooting: attributes.shooting ?? fallbackPlayer.attributes.shooting,
      passing: attributes.passing ?? fallbackPlayer.attributes.passing,
      dribbling: attributes.dribbling ?? fallbackPlayer.attributes.dribbling,
      defending: attributes.defending ?? fallbackPlayer.attributes.defending,
      creativity: attributes.creativity ?? fallbackPlayer.attributes.pace,
      physical: attributes.physical ?? fallbackPlayer.attributes.physical,
    },
  };
};

const metricLabelToAttributeKey = (metric: string): AttributeKey => {
  const normalized = metric.trim().toLowerCase();
  if (normalized === "pace" || normalized === "creativity") {
    return "creativity";
  }

  return (["shooting", "passing", "dribbling", "defending", "physical"].includes(normalized)
    ? normalized
    : "shooting") as AttributeKey;
};

const ComparePlayers = () => {
  const [directoryPlayers, setDirectoryPlayers] = useState<ApiDirectoryPlayer[]>([]);
  const [leftId, setLeftId] = useState(defaultLeftPlayer.id);
  const [rightId, setRightId] = useState(defaultRightPlayer.id);
  const [leftProfile, setLeftProfile] = useState<ApiPlayerProfile | null>(null);
  const [rightProfile, setRightProfile] = useState<ApiPlayerProfile | null>(null);
  const [comparisonPayload, setComparisonPayload] = useState<ApiPlayerComparisonResponse | null>(null);

  useEffect(() => {
    let active = true;

    const loadDirectory = async () => {
      try {
        const response = (await getPlayers({ limit: 500 })) as { players?: ApiDirectoryPlayer[] };
        if (!active) {
          return;
        }

        const livePlayers = (response.players || []).filter(isRenderablePlayer);
        setDirectoryPlayers(livePlayers);

        if (livePlayers[0]?.playerId) {
          setLeftId((current) =>
            current === defaultLeftPlayer.id || !livePlayers.some((player) => player.playerId === current)
              ? livePlayers[0].playerId
              : current,
          );
        }

        if (livePlayers[1]?.playerId) {
          setRightId((current) =>
            current === defaultRightPlayer.id || !livePlayers.some((player) => player.playerId === current)
              ? livePlayers[1].playerId
              : current,
          );
        }
      } catch (_error) {
        if (!active) {
          return;
        }

        setDirectoryPlayers([]);
      }
    };

    loadDirectory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfilesAndCompare = async () => {
      try {
        const [leftResponse, rightResponse, compareResponse] = await Promise.all([
          getPlayerProfile(leftId) as Promise<ApiPlayerProfile>,
          getPlayerProfile(rightId) as Promise<ApiPlayerProfile>,
          getPlayerComparison(leftId, rightId) as Promise<ApiPlayerComparisonResponse>,
        ]);

        if (!active) {
          return;
        }

        setLeftProfile(leftResponse);
        setRightProfile(rightResponse);
        setComparisonPayload(compareResponse);
      } catch (_error) {
        if (!active) {
          return;
        }

        setLeftProfile(null);
        setRightProfile(null);
        setComparisonPayload(null);
      }
    };

    if (leftId && rightId) {
      loadProfilesAndCompare();
    }

    return () => {
      active = false;
    };
  }, [leftId, rightId]);

  const leftDirectoryPlayer = directoryPlayers.find((player) => player.playerId === leftId);
  const rightDirectoryPlayer = directoryPlayers.find((player) => player.playerId === rightId);

  const leftPlayer = useMemo(
    () => mapProfileToPlayer(leftDirectoryPlayer, leftProfile, defaultLeftPlayer),
    [leftDirectoryPlayer, leftProfile],
  );
  const rightPlayer = useMemo(
    () => mapProfileToPlayer(rightDirectoryPlayer, rightProfile, defaultRightPlayer),
    [rightDirectoryPlayer, rightProfile],
  );

  const options = useMemo(() => {
    if (directoryPlayers.length) {
      return directoryPlayers.map((player) => ({
        value: player.playerId,
        label: player.name,
        subtitle: `${player.team || "Club"} | ${player.position || "Role"}`,
      }));
    }

    return fallbackPlayers.map((player) => ({
      value: player.id,
      label: player.name,
      subtitle: `${player.club} | ${player.position}`,
    }));
  }, [directoryPlayers]);

  const attrs = useMemo(() => {
    const liveMetrics = comparisonPayload?.radar?.map((point) => metricLabelToAttributeKey(point.metric));
    if (liveMetrics?.length) {
      return Array.from(new Set(liveMetrics));
    }

    return Object.keys(leftPlayer.attributes) as AttributeKey[];
  }, [comparisonPayload?.radar, leftPlayer.attributes]);

  const radarData = useMemo(
    () =>
      attrs.map((key) => {
        const livePoint = comparisonPayload?.radar?.find((point) => metricLabelToAttributeKey(point.metric) === key);

        return {
          attribute: key.charAt(0).toUpperCase() + key.slice(1),
          value: Number(livePoint?.playerOne ?? leftPlayer.attributes[key]),
        };
      }),
    [attrs, comparisonPayload?.radar, leftPlayer.attributes],
  );

  const secondaryRadar = useMemo(
    () =>
      attrs.map((key) => {
        const livePoint = comparisonPayload?.radar?.find((point) => metricLabelToAttributeKey(point.metric) === key);

        return {
          attribute: key.charAt(0).toUpperCase() + key.slice(1),
          value: Number(livePoint?.playerTwo ?? rightPlayer.attributes[key]),
        };
      }),
    [attrs, comparisonPayload?.radar, rightPlayer.attributes],
  );

  const headline = useMemo(() => {
    if (comparisonPayload?.summary) {
      return comparisonPayload.summary;
    }

    if (leftPlayer.rating > rightPlayer.rating) {
      return `${leftPlayer.name} leads by ${leftPlayer.rating - rightPlayer.rating} points`;
    }

    if (leftPlayer.rating < rightPlayer.rating) {
      return `${rightPlayer.name} leads by ${rightPlayer.rating - leftPlayer.rating} points`;
    }

    return "Dead even on overall rating";
  }, [comparisonPayload?.summary, leftPlayer.name, leftPlayer.rating, rightPlayer.name, rightPlayer.rating]);

  const categoryWinners = useMemo(() => {
    if (comparisonPayload?.categoryWinners?.length) {
      return comparisonPayload.categoryWinners.map((item) => ({
        label: metricLabelToAttributeKey(item.metric),
        winner:
          item.winner === "playerOne"
            ? leftPlayer.name
            : item.winner === "playerTwo"
              ? rightPlayer.name
              : "Tie",
      }));
    }

    return attrs.map((attr) => {
      const leftValue = Number(leftPlayer.attributes[attr]);
      const rightValue = Number(rightPlayer.attributes[attr]);

      return {
        label: attr,
        winner: leftValue > rightValue ? leftPlayer.name : rightValue > leftValue ? rightPlayer.name : "Tie",
      };
    });
  }, [attrs, comparisonPayload?.categoryWinners, leftPlayer.attributes, leftPlayer.name, rightPlayer.attributes, rightPlayer.name]);

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        <SectionHeader title="Compare Players" subtitle="Head-to-head analysis of elite talent" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <SearchableSelect options={options} value={leftId} onChange={setLeftId} placeholder="Select first player..." />
          <SearchableSelect options={options} value={rightId} onChange={setRightId} placeholder="Select second player..." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[leftPlayer, rightPlayer].map((player, idx) => (
            <motion.div
              key={`${player.id}-${idx}`}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-xl p-6 text-center sm:p-8"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-accent">
                <span className="font-display text-3xl text-foreground">{player.rating}</span>
              </div>
              <h2 className="font-display text-2xl tracking-wider text-foreground sm:text-3xl">{player.name}</h2>
              <p className="mt-1 text-sm font-body text-muted-foreground">
                {player.club} | {player.position}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {player.strengths.slice(0, 3).map((strength) => (
                  <span
                    key={strength}
                    className="rounded-full bg-secondary px-2 py-1 text-[10px] font-body text-secondary-foreground"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-block rounded-xl glass-card px-8 py-4"
        >
          <span className="font-display text-xl tracking-wider text-foreground">{headline}</span>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-xl glass-card p-6">
          <SectionHeader title="Attribute Radar" className="mb-2 text-center" />
          <div className="mb-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-3 bg-foreground" />
              <span className="text-xs font-body text-muted-foreground">{leftPlayer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-3 border-t border-dashed border-muted-foreground" />
              <span className="text-xs font-body text-muted-foreground">{rightPlayer.name}</span>
            </div>
          </div>
          <RadarChartComponent data={radarData} secondaryData={secondaryRadar} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <SectionHeader title="Attribute Breakdown" />
        <div className="space-y-3">
          {attrs.map((attr) => {
            const leftValue = Number(leftPlayer.attributes[attr]);
            const rightValue = Number(rightPlayer.attributes[attr]);
            const winner = leftValue > rightValue ? "left" : rightValue > leftValue ? "right" : "tie";

            return (
              <motion.div
                key={attr}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-3 items-center rounded-lg glass-card p-4 text-center"
              >
                <span
                  className={`font-display text-xl tracking-wide ${
                    winner === "left" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {leftValue}
                </span>
                <span className="text-xs font-body uppercase tracking-widest text-muted-foreground capitalize">
                  {attr}
                </span>
                <span
                  className={`font-display text-xl tracking-wide ${
                    winner === "right" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {rightValue}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader title="Category Winners" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categoryWinners.map((item) => (
            <div key={item.label} className="rounded-xl glass-card p-4 text-center">
              <p className="mb-1 text-[10px] font-body capitalize uppercase tracking-widest text-muted-foreground">
                {item.label}
              </p>
              <p className="font-display text-sm tracking-wide text-foreground">{item.winner}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComparePlayers;
