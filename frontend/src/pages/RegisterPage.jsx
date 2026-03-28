import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Get Started</p>
        <h1>Create your PlayerIQ account</h1>
        <form className="auth-form">
          <label>
            Name
            <input type="text" placeholder="Analyst Name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="analyst@playeriq.ai" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Choose a strong password" />
          </label>
          <button type="button">Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

