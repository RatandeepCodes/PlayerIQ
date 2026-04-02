import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, errorMeta, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const isFormValid =
    formData.name.trim().length >= 2 && formData.email.trim().length > 4 && formData.password.trim().length >= 8;
  const highlights = [
    { label: "Track", value: "Players and matches" },
    { label: "Compare", value: "Key performances" },
    { label: "Follow", value: "Every match day" },
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    clearError();

    try {
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (_error) {
      // Error state is already handled by the auth context.
    }
  }

  return (
    <AuthShell
      eyebrow="Get Started"
      title="Create account"
      subtitle="Set up your account and get in."
      highlights={highlights}
    >
      <p className="eyebrow">Create Account</p>
      <h2 className="auth-form-title">Join PlayerIQ</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(event) => {
                clearError();
                setFormData((current) => ({ ...current, name: event.target.value }));
              }}
            />
          </label>
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
                placeholder="Choose a password"
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
          <p className="auth-hint">Use at least 8 characters.</p>
          {error ? <p className="auth-error">{error}</p> : null}
          {errorMeta?.requestId ? <p className="auth-meta">Reference: {errorMeta.requestId}</p> : null}
          <button className="auth-submit" disabled={isLoading || !isFormValid} type="submit">
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
    </AuthShell>
  );
}
