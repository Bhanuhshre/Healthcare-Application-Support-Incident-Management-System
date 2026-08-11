import { useEffect, useState } from "react";
import { getReportSummary } from "../api/incidents";

const STATUS_ORDER = ["open", "in_progress", "on_hold", "resolved", "closed"];
const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loading">Loading reports...</div>;
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  const totalIncidents = Object.values(summary.by_status).reduce((sum, count) => sum + count, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports</h1>
        <p className="page-subtitle">Operational metrics across the incident lifecycle.</p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Incidents by status</h2>
        </div>
        <div className="report-bars">
          {STATUS_ORDER.map((status) => {
            const count = summary.by_status[status] || 0;
            const width = totalIncidents ? Math.max((count / totalIncidents) * 100, count > 0 ? 4 : 0) : 0;
            return (
              <div className="report-bar-row" key={status}>
                <span className="report-bar-label">{status.replace("_", " ")}</span>
                <div className="report-bar-track">
                  <div className={`report-bar-fill report-bar-status-${status}`} style={{ width: `${width}%` }} />
                </div>
                <span className="report-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Incidents by severity</h2>
        </div>
        <div className="report-bars">
          {SEVERITY_ORDER.map((severity) => {
            const count = summary.by_severity[severity] || 0;
            const width = totalIncidents ? Math.max((count / totalIncidents) * 100, count > 0 ? 4 : 0) : 0;
            return (
              <div className="report-bar-row" key={severity}>
                <span className="report-bar-label">{severity}</span>
                <div className="report-bar-track">
                  <div className={`report-bar-fill report-bar-severity-${severity}`} style={{ width: `${width}%` }} />
                </div>
                <span className="report-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Incidents per application</h2>
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
          <h2>Average resolution time</h2>
        </div>
        <p className="report-highlight">
          {summary.average_resolution_hours !== null
            ? `${summary.average_resolution_hours} hours from report to resolution`
            : "No incidents have been resolved yet."}
        </p>
      </div>
    </div>
  );
}
