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
    { label: "Players", value: "Profiles and form" },
    { label: "Matches", value: "Live match centre" },
    { label: "Compare", value: "Side-by-side view" },
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
      title="Sign in"
      subtitle="Pick up where you left off."
      highlights={highlights}
    >
      <p className="eyebrow">Sign In</p>
      <h2 className="auth-form-title">Access PlayerIQ</h2>
      {location.state?.from ? <p className="auth-hint">Continue to your page.</p> : null}
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
