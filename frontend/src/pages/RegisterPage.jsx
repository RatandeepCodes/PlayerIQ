import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await register(form);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Get Started</p>
        <h1>Create your football space</h1>
        <p className="auth-subcopy">
          Save the players you follow, compare stars across matches, and keep a closer eye on every big performance.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
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
              placeholder="Choose a password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          <button type="submit">Create Account</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
