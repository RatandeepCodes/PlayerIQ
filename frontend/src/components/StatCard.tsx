import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  index?: number;
}

const StatCard = ({ label, value, index = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="text-center px-4 py-6"
  >
    <div className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">{value}</div>
    <div className="text-xs text-muted-foreground font-body mt-1 uppercase tracking-widest">{label}</div>
  </motion.div>
);

export default StatCard;
