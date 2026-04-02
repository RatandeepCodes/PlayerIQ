import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState = ({ title, description, icon }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
    <h3 className="font-display text-xl text-foreground tracking-wide">{title}</h3>
    {description && <p className="mt-2 text-sm text-muted-foreground font-body max-w-sm">{description}</p>}
  </motion.div>
);

export default EmptyState;
