import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Player } from '@/data/mockData';

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
    <Link to={`/player?id=${player.id}`} className="block group">
      <div className="glass-card rounded-xl p-5 hover:border-foreground/20 transition-all duration-500 hover:glow-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-xl text-foreground tracking-wide">{player.name}</h3>
            <p className="text-xs text-muted-foreground font-body">{player.club} · {player.position}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
            <span className="font-display text-xl text-foreground">{player.rating}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {player.strengths.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] font-body px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default PlayerCard;
