import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-mark">HAISM</span>
          <span className="brand-full">Application Support &amp; Incident Management</span>
        </div>
        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Dashboard
          </NavLink>
          <NavLink to="/incidents" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Incidents
          </NavLink>
          <NavLink to="/applications" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Applications
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Reports
          </NavLink>
        </nav>
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-role">{user.role.replace("_", " ")}</span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
