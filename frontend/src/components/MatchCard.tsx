import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Match } from '@/data/mockData';

interface MatchCardProps {
  match: Match;
  index?: number;
  featured?: boolean;
}

const MatchCard = ({ match, index = 0, featured = false }: MatchCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
  >
    <Link to={`/match?id=${match.id}`} className="block group">
      <div className={`glass-card rounded-xl transition-all duration-500 hover:border-foreground/20 hover:glow-border ${featured ? 'p-8' : 'p-5'}`}>
        <div className="text-[10px] text-muted-foreground font-body mb-3 uppercase tracking-widest">
          {match.competition}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-right flex-1">
            <h3 className={`font-display tracking-wide text-foreground ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
              {match.homeTeam}
            </h3>
          </div>
          <div className={`mx-4 sm:mx-6 font-display text-foreground flex items-center gap-2 ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
            <span>{match.homeScore}</span>
            <span className="text-muted-foreground text-lg">—</span>
            <span>{match.awayScore}</span>
          </div>
          <div className="flex-1">
            <h3 className={`font-display tracking-wide text-foreground ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
              {match.awayTeam}
            </h3>
          </div>
        </div>
        {featured && (
          <div className="mt-4 text-xs text-muted-foreground font-body text-center">
            {match.venue} · {match.date}
          </div>
        )}
      </div>
    </Link>
  </motion.div>
);

export default MatchCard;
