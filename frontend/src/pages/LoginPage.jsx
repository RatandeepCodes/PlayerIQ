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
        <h1>Sign in to PlayerIQ</h1>
        <p className="auth-subcopy">Use your analyst account to access protected player intelligence dashboards.</p>
        {location.state?.from ? (
          <p className="auth-hint">Sign in first to continue to your requested workspace page.</p>
        ) : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="analyst@playeriq.ai"
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
          {errorMeta?.requestId ? <p className="auth-meta">Request ID: {errorMeta.requestId}</p> : null}
          <button className="auth-submit" disabled={isLoading || !isFormValid} type="submit">
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
