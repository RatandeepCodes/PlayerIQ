import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Welcome Back</p>
        <h1>Sign in to PlayerIQ</h1>
        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="analyst@playeriq.ai" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter your password" />
          </label>
          <button type="button">Login</button>
        </form>
        <p className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
