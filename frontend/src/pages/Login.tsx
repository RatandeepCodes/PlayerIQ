import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background bg-noise flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-foreground/[0.015] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl tracking-widest text-foreground">
            PlayerIQ
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="font-display text-2xl text-foreground tracking-wider text-center">Sign In</h1>
          <p className="text-sm text-muted-foreground font-body text-center mt-2">Access your football intelligence</p>

          <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs font-body text-muted-foreground uppercase tracking-widest mb-2 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-foreground text-primary-foreground text-sm font-body font-medium hover:bg-foreground/90 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-foreground hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
