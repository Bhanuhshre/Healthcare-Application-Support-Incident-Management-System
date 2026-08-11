import { Link } from "react-router-dom";
import { StatusBadge, SeverityBadge } from "./StatusBadge";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IncidentTable({ incidents, applicationsById }) {
  if (!incidents.length) {
    return <p className="empty-state">No incidents match the current filters.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Application</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Reported</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((incident) => (
          <tr key={incident.id}>
            <td>
              <Link className="table-link" to={`/incidents/${incident.id}`}>
                {incident.title}
              </Link>
            </td>
            <td>{applicationsById?.[incident.application_id]?.name || `#${incident.application_id}`}</td>
            <td>
              <SeverityBadge value={incident.severity} />
            </td>
            <td>
              <StatusBadge value={incident.status} />
            </td>
            <td>{incident.assigned_to ? incident.assigned_to.full_name : "Unassigned"}</td>
            <td>{formatDate(incident.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
