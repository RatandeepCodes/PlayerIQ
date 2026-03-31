import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, errorMeta, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const targetPath = location.state?.from || "/dashboard";
  const isFormValid = formData.email.trim().length > 4 && formData.password.trim().length >= 8;

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
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Welcome Back</p>
        <h1>Sign in and step back into the game</h1>
        <p className="auth-subcopy">
          Follow favourite players, revisit standout performances, and keep your football world in one place.
        </p>
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
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(event) => {
                clearError();
                setFormData((current) => ({ ...current, password: event.target.value }));
              }}
            />
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
      </div>
    </div>
  );
}
