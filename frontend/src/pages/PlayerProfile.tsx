import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Shield, Target, Zap } from "lucide-react";

import { getPlayerHistory, getPlayerProfile, getPlayers } from "@/api/client.js";
import Footer from "@/components/Footer";
import FormChart from "@/components/FormChart";
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

type ProfileSnapshot = {
  overallRating?: number | null;
  ppi?: number | null;
};

const defaultFallbackPlayer = fallbackPlayers[0];

const buildPlaceholderPlayer = (playerId: string) => ({
  id: playerId,
  name: "Loading player",
  club: "Loading club",
  nationality: "Loading nationality",
  position: "Profile",
  age: defaultFallbackPlayer.age,
  rating: defaultFallbackPlayer.rating,
  attributes: defaultFallbackPlayer.attributes,
  recentForm: defaultFallbackPlayer.recentForm,
  strengths: defaultFallbackPlayer.strengths,
  growthAreas: defaultFallbackPlayer.growthAreas,
  playstyle: "Profile details are loading from PlayerIQ.",
  summary: "PlayerIQ is preparing this player profile.",
  pressureRating: defaultFallbackPlayer.pressureRating,
});

const mapProfileToDisplayPlayer = ({
  playerId,
  directoryPlayer,
  profile,
  snapshots,
}: {
  playerId: string;
  directoryPlayer?: DirectoryPlayer | null;
  profile?: any;
  snapshots?: ProfileSnapshot[];
}) => {
  const fallbackByName =
    fallbackPlayers.find(
      (candidate) =>
        candidate.name.toLowerCase() === String(profile?.player?.name || directoryPlayer?.name || "").toLowerCase(),
    ) || defaultFallbackPlayer;

  const attributes = profile?.analytics?.attributes || {};
  const pressurePayload = profile?.analytics?.pressure || {};
  const historySeries =
    snapshots && snapshots.length
      ? snapshots
          .map((snapshot) => {
            const sourceValue = snapshot.overallRating ?? snapshot.ppi ?? null;
            if (sourceValue === null || sourceValue === undefined) {
              return null;
            }

            return Math.max(6, Math.min(10, Number(sourceValue) / 10));
          })
          .filter(Boolean)
      : [];

  return {
    ...fallbackByName,
    id: profile?.player?.playerId || directoryPlayer?.playerId || playerId,
    name: profile?.player?.name || directoryPlayer?.name || fallbackByName.name,
    club: profile?.player?.team || directoryPlayer?.team || fallbackByName.club,
    nationality: profile?.player?.nationality || directoryPlayer?.nationality || fallbackByName.nationality,
    position: profile?.player?.position || directoryPlayer?.position || fallbackByName.position,
    rating: profile?.overview?.overallRating ?? fallbackByName.rating,
    summary: profile?.overview?.reportSummary || fallbackByName.summary,
    playstyle:
      profile?.analytics?.playstyleProfile?.name ||
      profile?.overview?.playstyle ||
      fallbackByName.playstyle,
    pressureRating:
      pressurePayload?.pressureScore ??
      (profile?.overview?.pressureIndex !== null && profile?.overview?.pressureIndex !== undefined
        ? Math.round(Number(profile.overview.pressureIndex) * 100)
        : fallbackByName.pressureRating),
    strengths:
      profile?.analytics?.report?.strengths?.length > 0
        ? profile.analytics.report.strengths
        : fallbackByName.strengths,
    growthAreas:
      profile?.analytics?.report?.developmentAreas?.length > 0
        ? profile.analytics.report.developmentAreas
        : fallbackByName.growthAreas,
    attributes: {
      shooting: attributes.shooting ?? fallbackByName.attributes.shooting,
      passing: attributes.passing ?? fallbackByName.attributes.passing,
      dribbling: attributes.dribbling ?? fallbackByName.attributes.dribbling,
      defending: attributes.defending ?? fallbackByName.attributes.defending,
      creativity: attributes.creativity ?? fallbackByName.attributes.pace,
      physical: attributes.physical ?? fallbackByName.attributes.physical,
    },
    recentForm: historySeries.length ? historySeries : fallbackByName.recentForm,
  };
};

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [directoryPlayers, setDirectoryPlayers] = useState<DirectoryPlayer[]>([]);
  const [profilePayload, setProfilePayload] = useState<any>(null);
  const [historyPayload, setHistoryPayload] = useState<{ snapshots?: ProfileSnapshot[] } | null>(null);

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

        if (!id && livePlayers[0]?.playerId) {
          navigate(`/player/${livePlayers[0].playerId}`, { replace: true });
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
  }, [id, navigate]);

  useEffect(() => {
    let active = true;

    if (!id) {
      return () => {
        active = false;
      };
    }

    const loadProfile = async () => {
      try {
        const [profileResponse, historyResponse] = await Promise.all([
          getPlayerProfile(id),
          getPlayerHistory(id),
        ]);

        if (!active) {
          return;
        }

        setProfilePayload(profileResponse);
        setHistoryPayload(historyResponse);
      } catch (_error) {
        if (!active) {
          return;
        }

        setProfilePayload(null);
        setHistoryPayload(null);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [id]);

  const currentPlayerId = id || directoryPlayers[0]?.playerId || defaultFallbackPlayer.id;
  const directoryPlayer = directoryPlayers.find((candidate) => candidate.playerId === currentPlayerId) || null;

  const player = useMemo(() => {
    if (profilePayload || directoryPlayer) {
      return mapProfileToDisplayPlayer({
        playerId: currentPlayerId,
        directoryPlayer,
        profile: profilePayload,
        snapshots: historyPayload?.snapshots || [],
      });
    }

    return buildPlaceholderPlayer(currentPlayerId);
  }, [currentPlayerId, directoryPlayer, historyPayload?.snapshots, profilePayload]);

  const radarData = useMemo(
    () =>
      Object.entries(player.attributes).map(([key, value]) => ({
        attribute: key.charAt(0).toUpperCase() + key.slice(1),
        value: Number(value),
      })),
    [player.attributes],
  );

  const options = useMemo(() => {
    if (directoryPlayers.length) {
      return directoryPlayers.map((candidate) => ({
        value: candidate.playerId,
        label: candidate.name,
        subtitle: `${candidate.team || "Club"} · ${candidate.position || "Role"}`,
      }));
    }

    return fallbackPlayers.map((candidate) => ({
      value: candidate.id,
      label: candidate.name,
      subtitle: `${candidate.club} · ${candidate.position}`,
    }));
  }, [directoryPlayers]);

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-xs">
          <SearchableSelect
            options={options}
            value={currentPlayerId}
            onChange={(nextId) => navigate(`/player/${nextId}`)}
            placeholder="Search players..."
          />
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl p-6">
          <SectionHeader title="Recent Form" className="mb-4" />
          <FormChart data={player.recentForm} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
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
