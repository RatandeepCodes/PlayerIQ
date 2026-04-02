import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError("Fill in your name, email, and password to create an account.");
      return;
    }

    if (password.trim().length < 6) {
      setLocalError("Use a password with at least 6 characters.");
      return;
    }

    setLocalError("");

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/", { replace: true });
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
          <h1 className="text-center font-display text-2xl tracking-wider text-foreground">Create Account</h1>
          <p className="mt-2 text-center text-sm font-body text-muted-foreground">Join the PlayerIQ football experience.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-body uppercase tracking-widest text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setLocalError("");
                  clearError();
                }}
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm font-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

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
                  placeholder="Create a password"
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
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
