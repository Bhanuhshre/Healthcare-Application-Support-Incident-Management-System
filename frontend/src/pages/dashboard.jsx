import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listIncidents, getReportSummary } from "../api/incidents";
import { listApplications } from "../api/applications";
import IncidentTable from "../components/IncidentTable";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [applicationsById, setApplicationsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, incidentData, applicationData] = await Promise.all([
          getReportSummary(),
          listIncidents(),
          listApplications(),
        ]);
        setSummary(summaryData);
        setIncidents(incidentData.slice(0, 8));
        setApplicationsById(Object.fromEntries(applicationData.map((app) => [app.id, app])));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  const openCount = summary.by_status.open || 0;
  const inProgressCount = summary.by_status.in_progress || 0;
  const criticalCount = summary.by_severity.critical || 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">A snapshot of current incidents across all applications.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Open incidents</span>
          <span className="stat-value">{openCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In progress</span>
          <span className="stat-value">{inProgressCount}</span>
        </div>
        <div className="stat-card stat-card-alert">
          <span className="stat-label">Critical severity</span>
          <span className="stat-value">{criticalCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average resolution time</span>
          <span className="stat-value">
            {summary.average_resolution_hours !== null ? `${summary.average_resolution_hours} hrs` : "No data yet"}
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Incidents by application</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Total incidents</th>
            </tr>
          </thead>
          <tbody>
            {summary.by_application.map((row) => (
              <tr key={row.application}>
                <td>{row.application}</td>
                <td>{row.incident_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Recent incidents</h2>
          <Link className="btn btn-secondary" to="/incidents">
            View all incidents
          </Link>
        </div>
        <IncidentTable incidents={incidents} applicationsById={applicationsById} />
      </div>
    </div>
  );
}
