replace active mock views with backend mappings and cleanup


<<<<<<< HEAD
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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

const defaultLeft = fallbackPlayers[0];
const defaultRight = fallbackPlayers[2] || fallbackPlayers[1];

const mapProfileToCard = (profile: any, fallbackPlayer: (typeof fallbackPlayers)[number]) => {
  const report = profile?.analytics?.report;

  return {
    id: profile?.player?.playerId || fallbackPlayer.id,
    name: profile?.player?.name || fallbackPlayer.name,
    club: profile?.player?.team || fallbackPlayer.club,
    position: profile?.player?.position || fallbackPlayer.position,
    nationality: profile?.player?.nationality || fallbackPlayer.nationality,
    rating: profile?.overview?.overallRating ?? fallbackPlayer.rating,
    strengths: report?.strengths?.length ? report.strengths : fallbackPlayer.strengths,
    attributes: {
      shooting: profile?.analytics?.attributes?.shooting ?? fallbackPlayer.attributes.shooting,
      passing: profile?.analytics?.attributes?.passing ?? fallbackPlayer.attributes.passing,
      dribbling: profile?.analytics?.attributes?.dribbling ?? fallbackPlayer.attributes.dribbling,
      defending: profile?.analytics?.attributes?.defending ?? fallbackPlayer.attributes.defending,
      creativity: profile?.analytics?.attributes?.creativity ?? fallbackPlayer.attributes.pace,
      physical: profile?.analytics?.attributes?.physical ?? fallbackPlayer.attributes.physical,
    },
  };
};

const buildFallbackRadar = (
  leftPlayer: ReturnType<typeof mapProfileToCard>,
  rightPlayer: ReturnType<typeof mapProfileToCard>,
) => {
  const attrs = Object.keys(leftPlayer.attributes) as (keyof typeof leftPlayer.attributes)[];

  return attrs.map((key) => ({
    metric: key.charAt(0).toUpperCase() + key.slice(1),
    playerOne: leftPlayer.attributes[key],
    playerTwo: rightPlayer.attributes[key],
  }));
};

const ComparePlayers = () => {
  const [directoryPlayers, setDirectoryPlayers] = useState<DirectoryPlayer[]>([]);
  const [leftId, setLeftId] = useState(defaultLeft.id);
  const [rightId, setRightId] = useState(defaultRight.id);
  const [leftProfile, setLeftProfile] = useState<any>(null);
  const [rightProfile, setRightProfile] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    let active = true;

    const loadDirectory = async () => {
      try {
        const response = await getPlayers({ limit: 50 });
        if (!active) {
          return;
        }

        const players = response.players || [];
        setDirectoryPlayers(players);

        if (players[0]?.playerId) {
          setLeftId((current) => (current === defaultLeft.id ? players[0].playerId : current));
        }

        if (players[1]?.playerId) {
          setRightId((current) => (current === defaultRight.id ? players[1].playerId : current));
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

    const loadComparison = async () => {
      if (!leftId || !rightId) {
        return;
      }

      try {
        const [leftResponse, rightResponse, comparisonResponse] = await Promise.all([
          getPlayerProfile(leftId),
          getPlayerProfile(rightId),
          getPlayerComparison(leftId, rightId),
        ]);

        if (!active) {
          return;
        }

        setLeftProfile(leftResponse);
        setRightProfile(rightResponse);
        setComparison(comparisonResponse);
      } catch (_error) {
        if (!active) {
          return;
        }

        setLeftProfile(null);
        setRightProfile(null);
        setComparison(null);
      }
    };

    loadComparison();

    return () => {
      active = false;
    };
  }, [leftId, rightId]);

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

  const leftPlayer = useMemo(
    () => mapProfileToCard(leftProfile, fallbackPlayers.find((player) => player.id === leftId) || defaultLeft),
    [leftId, leftProfile],
  );

  const rightPlayer = useMemo(
    () => mapProfileToCard(rightProfile, fallbackPlayers.find((player) => player.id === rightId) || defaultRight),
    [rightId, rightProfile],
  );

  const radarSource = comparison?.radar?.length ? comparison.radar : buildFallbackRadar(leftPlayer, rightPlayer);
  const radarData = radarSource.map((point: any) => ({
    attribute: point.metric,
    value: point.playerOne,
  }));
  const secondaryRadar = radarSource.map((point: any) => ({
    attribute: point.metric,
    value: point.playerTwo,
  }));

  const comparisonHeadline = comparison?.winner?.name
    ? `${comparison.winner.name} has the edge`
    : comparison?.summary || "Dead even on overall rating";

  const metricRows = radarSource.map((point: any) => {
    const label = point.metric.toLowerCase();
    const leftValue = Number(point.playerOne ?? 0);
    const rightValue = Number(point.playerTwo ?? 0);
    const winner = leftValue > rightValue ? "left" : rightValue > leftValue ? "right" : "tie";

    return {
      attr: label,
      leftValue,
      rightValue,
      winner,
    };
  });

  const categoryWinners =
    comparison?.categoryWinners?.length > 0
      ? comparison.categoryWinners.map((item: any) => ({
          label: item.metric,
          winner:
            item.winner === "playerOne"
              ? leftPlayer.name
              : item.winner === "playerTwo"
                ? rightPlayer.name
                : "Tie",
        }))
      : metricRows.map((item) => ({
          label: item.attr,
          winner:
            item.winner === "left"
              ? leftPlayer.name
              : item.winner === "right"
                ? rightPlayer.name
                : "Tie",
        }));
=======
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
>>>>>>> frontend-integration

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        <SectionHeader title="Compare Players" subtitle="Head-to-head analysis of elite talent" />
      </div>

<<<<<<< HEAD
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <SearchableSelect
            options={options}
            value={leftId}
            onChange={setLeftId}
            placeholder="Select first player..."
          />
          <SearchableSelect
            options={options}
            value={rightId}
            onChange={setRightId}
            placeholder="Select second player..."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[leftPlayer, rightPlayer].map((player, index) => (
=======
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <SearchableSelect options={options} value={leftId} onChange={setLeftId} placeholder="Select first player..." />
          <SearchableSelect options={options} value={rightId} onChange={setRightId} placeholder="Select second player..." />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[leftPlayer, rightPlayer].map((player, idx) => (
>>>>>>> frontend-integration
            <motion.div
              key={`${player.id}-${index}`}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-xl p-6 text-center sm:p-8"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-accent">
                <span className="font-display text-3xl text-foreground">{player.rating}</span>
              </div>
<<<<<<< HEAD
              <h2 className="font-display text-2xl tracking-wider text-foreground sm:text-3xl">{player.name}</h2>
              <p className="mt-1 text-sm font-body text-muted-foreground">
                {player.club} · {player.position}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {player.strengths.slice(0, 3).map((strength) => (
                  <span
                    key={strength}
                    className="rounded-full bg-secondary px-2 py-1 text-[10px] font-body text-secondary-foreground"
                  >
=======
              <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wider">{player.name}</h2>
              <p className="text-sm text-muted-foreground font-body mt-1">{player.club} · {player.position}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {player.strengths.slice(0, 3).map((strength) => (
                  <span key={strength} className="text-[10px] font-body px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
>>>>>>> frontend-integration
                    {strength}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      <section className="mx-auto max-w-7xl px-4 pb-12 text-center sm:px-6 lg:px-8">
=======
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-center">
>>>>>>> frontend-integration
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-block rounded-xl glass-card px-8 py-4"
        >
<<<<<<< HEAD
          <span className="font-display text-xl tracking-wider text-foreground">{comparisonHeadline}</span>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-xl glass-card p-6">
=======
          <span className="font-display text-xl text-foreground tracking-wider">{headline}</span>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass-card rounded-xl p-6 max-w-xl mx-auto">
>>>>>>> frontend-integration
          <SectionHeader title="Attribute Radar" className="mb-2 text-center" />
          <div className="mb-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-3 bg-foreground" />
              <span className="text-xs font-body text-muted-foreground">{leftPlayer.name}</span>
            </div>
            <div className="flex items-center gap-2">
<<<<<<< HEAD
              <div
                className="w-3 border-dashed border-muted-foreground"
                style={{ borderTopWidth: "1px" }}
              />
=======
              <div className="w-3 h-0.5 bg-muted-foreground border-dashed" style={{ borderTop: "1px dashed" }} />
>>>>>>> frontend-integration
              <span className="text-xs font-body text-muted-foreground">{rightPlayer.name}</span>
            </div>
          </div>
          <RadarChartComponent data={radarData} secondaryData={secondaryRadar} />
        </div>
      </section>

<<<<<<< HEAD
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <SectionHeader title="Attribute Breakdown" />
        <div className="space-y-3">
          {metricRows.map((item) => (
            <motion.div
              key={item.attr}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 items-center rounded-lg glass-card p-4 text-center"
            >
              <span
                className={`font-display text-xl tracking-wide ${
                  item.winner === "left" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.leftValue}
              </span>
              <span className="text-xs font-body capitalize uppercase tracking-widest text-muted-foreground">
                {item.attr}
              </span>
              <span
                className={`font-display text-xl tracking-wide ${
                  item.winner === "right" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.rightValue}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader title="Category Winners" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categoryWinners.map((item: any) => (
            <div key={item.label} className="rounded-xl glass-card p-4 text-center">
              <p className="mb-1 text-[10px] font-body uppercase tracking-widest text-muted-foreground capitalize">
                {item.label}
              </p>
              <p className="font-display text-sm tracking-wide text-foreground">{item.winner}</p>
            </div>
          ))}
=======
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
>>>>>>> frontend-integration
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComparePlayers;
