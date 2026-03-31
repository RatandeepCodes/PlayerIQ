import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Get Started</p>
        <h1>Create your football space</h1>
        <p className="auth-subcopy">
          Save the players you follow, compare stars across matches, and keep a closer eye on every big performance.
        </p>
        <form className="auth-form">
          <label>
            Name
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Choose a password" />
          </label>
          <button type="button">Create Account</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
