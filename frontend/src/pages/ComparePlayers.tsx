import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { getPlayerComparison, getPlayerProfile, getPlayers } from "@/api/client.js";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RadarChartComponent from "@/components/RadarChart";
import SearchableSelect from "@/components/SearchableSelect";
import SectionHeader from "@/components/SectionHeader";
import { players as fallbackPlayers } from "@/data/mockData";

type DirectoryPlayer = {
  playerId: string;
  name: string;
  team?: string;
  position?: string;
  nationality?: string;
};

const defaultLeftPlayer = fallbackPlayers[0];
const defaultRightPlayer = fallbackPlayers[2] || fallbackPlayers[1];

const mapProfileToPlayer = (
  directoryPlayer: DirectoryPlayer | undefined,
  profile: any,
  fallbackPlayer: (typeof fallbackPlayers)[number],
) => {
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
    playstyle:
      profile?.analytics?.playstyleProfile?.name ||
      profile?.overview?.playstyle ||
      fallbackPlayer.playstyle,
    pressureRating:
      profile?.analytics?.pressure?.pressureScore ??
      (profile?.overview?.pressureIndex !== null && profile?.overview?.pressureIndex !== undefined
        ? Math.round(Number(profile.overview.pressureIndex) * 100)
        : fallbackPlayer.pressureRating),
    strengths:
      profile?.analytics?.report?.strengths?.length > 0
        ? profile.analytics.report.strengths
        : fallbackPlayer.strengths,
    growthAreas:
      profile?.analytics?.report?.developmentAreas?.length > 0
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

const metricLabelToAttributeKey = (metric: string) => {
  const normalized = metric.trim().toLowerCase();
  if (normalized === "pace" || normalized === "creativity") {
    return "creativity";
  }

  return normalized;
};

const ComparePlayers = () => {
  const [directoryPlayers, setDirectoryPlayers] = useState<DirectoryPlayer[]>([]);
  const [leftId, setLeftId] = useState(defaultLeftPlayer.id);
  const [rightId, setRightId] = useState(defaultRightPlayer.id);
  const [leftProfile, setLeftProfile] = useState<any>(null);
  const [rightProfile, setRightProfile] = useState<any>(null);
  const [comparisonPayload, setComparisonPayload] = useState<any>(null);

  useEffect(() => {
    let active = true;

    const loadDirectory = async () => {
      try {
        const response = await getPlayers({ limit: 50 });
        if (!active) {
          return;
        }

        const livePlayers = response.players || [];
        setDirectoryPlayers(livePlayers);

        if (livePlayers[0]?.playerId) {
          setLeftId((current) => (current === defaultLeftPlayer.id ? livePlayers[0].playerId : current));
        }

        if (livePlayers[1]?.playerId) {
          setRightId((current) => (current === defaultRightPlayer.id ? livePlayers[1].playerId : current));
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
          getPlayerProfile(leftId),
          getPlayerProfile(rightId),
          getPlayerComparison(leftId, rightId),
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
        subtitle: `${player.team || "Club"} · ${player.position || "Role"}`,
      }));
    }

    return fallbackPlayers.map((player) => ({
      value: player.id,
      label: player.name,
      subtitle: `${player.club} · ${player.position}`,
    }));
  }, [directoryPlayers]);

  const attrs = useMemo(() => {
    const liveMetrics = comparisonPayload?.radar?.map((point: any) => metricLabelToAttributeKey(point.metric));
    if (liveMetrics?.length) {
      return Array.from(new Set(liveMetrics));
    }

    return Object.keys(leftPlayer.attributes) as (keyof typeof leftPlayer.attributes)[];
  }, [comparisonPayload?.radar, leftPlayer.attributes]);

  const radarData = useMemo(
    () =>
      attrs.map((key) => {
        const livePoint = comparisonPayload?.radar?.find(
          (point: any) => metricLabelToAttributeKey(point.metric) === key,
        );

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
        const livePoint = comparisonPayload?.radar?.find(
          (point: any) => metricLabelToAttributeKey(point.metric) === key,
        );

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

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <SectionHeader
          title="Compare Players"
          subtitle="Head-to-head analysis of elite talent"
        />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <SearchableSelect options={options} value={leftId} onChange={setLeftId} placeholder="Select first player..." />
          <SearchableSelect options={options} value={rightId} onChange={setRightId} placeholder="Select second player..." />
        </div>
      </section>

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
                {player.strengths.slice(0, 3).map((strength) => (
                  <span key={strength} className="text-[10px] font-body px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {strength}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-block glass-card rounded-xl px-8 py-4"
        >
          <span className="font-display text-xl text-foreground tracking-wider">{headline}</span>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass-card rounded-xl p-6 max-w-xl mx-auto">
          <SectionHeader title="Attribute Radar" className="mb-2 text-center" />
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-foreground" />
              <span className="text-xs font-body text-muted-foreground">{leftPlayer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-muted-foreground border-dashed" style={{ borderTop: "1px dashed" }} />
              <span className="text-xs font-body text-muted-foreground">{rightPlayer.name}</span>
            </div>
          </div>
          <RadarChartComponent data={radarData} secondaryData={secondaryRadar} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                className="glass-card rounded-lg p-4 grid grid-cols-3 items-center text-center"
              >
                <span className={`font-display text-xl tracking-wide ${winner === "left" ? "text-foreground" : "text-muted-foreground"}`}>
                  {leftValue}
                </span>
                <span className="text-xs font-body text-muted-foreground uppercase tracking-widest capitalize">
                  {attr}
                </span>
                <span className={`font-display text-xl tracking-wide ${winner === "right" ? "text-foreground" : "text-muted-foreground"}`}>
                  {rightValue}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SectionHeader title="Category Winners" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {attrs.map((attr) => {
            const leftValue = Number(leftPlayer.attributes[attr]);
            const rightValue = Number(rightPlayer.attributes[attr]);
            const winnerName = leftValue > rightValue ? leftPlayer.name : rightValue > leftValue ? rightPlayer.name : "Tie";

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
