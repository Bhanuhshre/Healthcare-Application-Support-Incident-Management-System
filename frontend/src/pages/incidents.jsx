import { useEffect, useState } from "react";
import { listIncidents, createIncident } from "../api/incidents";
import { listApplications } from "../api/applications";
import IncidentTable from "../components/IncidentTable";
import IncidentForm from "../components/IncidentForm";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["open", "in_progress", "on_hold", "resolved", "closed"];
const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"];

export default function Incidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: "", severity: "", application_id: "" });

  async function loadIncidents(activeFilters) {
    setLoading(true);
    try {
      const data = await listIncidents(activeFilters);
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listApplications()
      .then(setApplications)
      .catch((err) => setError(err.message));
    loadIncidents(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadIncidents(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const applicationsById = Object.fromEntries(applications.map((app) => [app.id, app]));

  async function handleCreate(payload) {
    await createIncident(payload);
    setShowForm(false);
    await loadIncidents(filters);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Incidents</h1>
        <p className="page-subtitle">Track and manage support incidents across every application.</p>
      </div>

      <div className="filter-bar">
        <div className="form-field">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="filter-severity">Severity</label>
          <select
            id="filter-severity"
            value={filters.severity}
            onChange={(event) => setFilters({ ...filters, severity: event.target.value })}
          >
            <option value="">All severities</option>
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="filter-application">Application</label>
          <select
            id="filter-application"
            value={filters.application_id}
            onChange={(event) => setFilters({ ...filters, application_id: event.target.value })}
          >
            <option value="">All applications</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        {user && user.role !== "viewer" && (
          <button className="btn btn-primary filter-bar-action" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "Report incident"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <h2>Report a new incident</h2>
          </div>
          <IncidentForm applications={applications} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="panel">
        {loading ? (
          <div className="page-loading">Loading incidents...</div>
        ) : (
          <IncidentTable incidents={incidents} applicationsById={applicationsById} />
        )}
      </div>
    </div>
  );
}
