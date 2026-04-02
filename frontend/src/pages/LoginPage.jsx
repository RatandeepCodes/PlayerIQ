import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate(location.state?.from || "/dashboard", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Welcome Back</p>
        <h1>Sign in and step back into the game</h1>
        <p className="auth-subcopy">
          Follow favourite players, revisit standout performances, and keep your football world in one place.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          <button type="submit">Sign In</button>
        </form>
        <p className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
