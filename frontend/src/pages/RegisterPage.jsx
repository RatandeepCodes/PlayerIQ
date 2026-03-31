import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, errorMeta, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const isFormValid =
    formData.name.trim().length >= 2 && formData.email.trim().length > 4 && formData.password.trim().length >= 8;

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
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Get Started</p>
        <h1>Create your PlayerIQ account</h1>
        <p className="auth-subcopy">Create a user account to save access to the PlayerIQ football intelligence workspace.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              placeholder="Analyst Name"
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
              placeholder="Choose a strong password"
              value={formData.password}
              onChange={(event) => {
                clearError();
                setFormData((current) => ({ ...current, password: event.target.value }));
              }}
            />
          </label>
          <p className="auth-hint">Use at least 8 characters so your account meets backend validation rules.</p>
          {error ? <p className="auth-error">{error}</p> : null}
          {errorMeta?.requestId ? <p className="auth-meta">Request ID: {errorMeta.requestId}</p> : null}
          <button className="auth-submit" disabled={isLoading || !isFormValid} type="submit">
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
