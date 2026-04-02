import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const redirectTo = useMemo(() => location.state?.from || "/", [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setLocalError("Enter your email and password to continue.");
      return;
    }

    setLocalError("");

    try {
      await login({
        email: email.trim(),
        password,
      });
      navigate(redirectTo, { replace: true });
    } catch (_authError) {
      // AuthContext already stores the friendly error message.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-noise px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.015] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-3xl tracking-widest text-foreground">
            PlayerIQ
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-center font-display text-2xl tracking-wider text-foreground">Sign In</h1>
          <p className="mt-2 text-center text-sm font-body text-muted-foreground">Access your football workspace.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-body uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLocalError("");
                  clearError();
                }}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-body uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setLocalError("");
                    clearError();
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-12 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {localError || error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-body text-destructive">
                {localError || error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-foreground py-3 text-sm font-body font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-muted-foreground">
            Don&apos;t have an account?{" "}
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
