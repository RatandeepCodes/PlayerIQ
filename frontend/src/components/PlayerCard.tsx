import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import type { Player } from "@/data/mockData";

interface PlayerCardProps {
  player: Player;
  index?: number;
}

const PlayerCard = ({ player, index = 0 }: PlayerCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
  >
    <Link to={`/player/${player.id}`} className="block group">
      <div className="glass-card rounded-xl p-5 transition-all duration-500 hover:border-foreground/20 hover:glow-border">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl tracking-wide text-foreground">{player.name}</h3>
            <p className="font-body text-xs text-muted-foreground">
              {player.club} · {player.position}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
            <span className="font-display text-xl text-foreground">{player.rating}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {player.strengths.slice(0, 3).map((strength) => (
            <span
              key={strength}
              className="rounded-full bg-secondary px-2 py-1 text-[10px] font-body text-secondary-foreground"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default PlayerCard;
