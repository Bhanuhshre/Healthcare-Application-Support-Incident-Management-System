import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "viewer", label: "Viewer - read only access" },
  { value: "support_agent", label: "Support Agent - manage incidents" },
  { value: "admin", label: "Administrator - full access" },
];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !username.trim() || !email.trim() || password.length < 8) {
      setError("Please fill in every field. Passwords must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-mark">HAISM</span>
          <h1>Create an account</h1>
          <p>Register to start tracking application incidents</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="full-name">Full name</label>
            <input id="full-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>

          <div className="form-field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>

          <div className="form-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-role">Role</label>
            <select id="reg-role" value={role} onChange={(event) => setRole(event.target.value)}>
              {ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
