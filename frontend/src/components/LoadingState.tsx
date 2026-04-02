import { motion } from 'framer-motion';

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className="w-8 h-8 rounded-full border-2 border-muted border-t-foreground"
    />
    <p className="mt-4 text-sm text-muted-foreground font-body">Loading...</p>
  </div>
);

export default LoadingState;
