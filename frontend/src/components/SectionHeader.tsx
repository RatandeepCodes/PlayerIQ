import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const SectionHeader = ({ title, subtitle, className = '' }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`mb-8 ${className}`}
  >
    <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-wider">{title}</h2>
    {subtitle && <p className="mt-2 text-sm text-muted-foreground font-body">{subtitle}</p>}
  </motion.div>
);

export default SectionHeader;
