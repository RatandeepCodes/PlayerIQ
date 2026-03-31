import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Welcome Back</p>
        <h1>Sign in and step back into the game</h1>
        <p className="auth-subcopy">
          Follow favourite players, revisit standout performances, and keep your football world in one place.
        </p>
        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter your password" />
          </label>
          <button type="button">Sign In</button>
        </form>
        <p className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
