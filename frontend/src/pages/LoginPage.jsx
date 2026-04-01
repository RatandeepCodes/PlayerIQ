import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, errorMeta, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const targetPath = location.state?.from || "/dashboard";
  const isFormValid = formData.email.trim().length > 4 && formData.password.trim().length >= 8;
  const highlights = [
    { label: "Featured Star", value: "Sunil Chhetri", note: "Front and centre in the current fan view" },
    { label: "Big Match", value: "Bengaluru FC vs Kerala Blasters", note: "Ready to explore on Match Day" },
    { label: "What You Get", value: "Player stories and live match feel", note: "Built for football fans, not just data people" },
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    clearError();

    try {
      await login(formData);
      navigate(targetPath, { replace: true });
    } catch (_error) {
      // Error state is already handled by the auth context.
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in and step back into the game"
      subtitle="Follow favourite players, revisit standout performances, and keep your football world in one place."
      highlights={highlights}
      footer="Tip: press Enter after filling your details to sign in quickly."
    >
      <p className="eyebrow">Sign In</p>
      <h2 className="auth-form-title">Access your football space</h2>
      <p className="auth-panel-copy">Pick up from where you left off and jump straight into the players and matches you care about.</p>
        {location.state?.from ? <p className="auth-hint">Sign in to continue where you left off.</p> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(event) => {
                clearError();
                setFormData((current) => ({ ...current, email: event.target.value }));
              }}
            />
          </label>
          <label>
            Password
            <div className="auth-input-row">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(event) => {
                  clearError();
                  setFormData((current) => ({ ...current, password: event.target.value }));
                }}
              />
              <button
                className="auth-inline-button"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <p className="auth-helper-text">Use the same email and password you used when joining PlayerIQ.</p>
          {error ? <p className="auth-error">{error}</p> : null}
          {errorMeta?.requestId ? <p className="auth-meta">Reference: {errorMeta.requestId}</p> : null}
          <button className="auth-submit" disabled={isLoading || !isFormValid} type="submit">
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
    </AuthShell>
  );
}
