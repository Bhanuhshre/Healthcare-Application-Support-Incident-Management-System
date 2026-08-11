const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  on_hold: "On Hold",
  resolved: "Resolved",
  closed: "Closed",
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
  maintenance: "Maintenance",
};

const SEVERITY_LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function StatusBadge({ value }) {
  const label = STATUS_LABELS[value] || value;
  return <span className={`badge badge-status-${value}`}>{label}</span>;
}

export function SeverityBadge({ value }) {
  const label = SEVERITY_LABELS[value] || value;
  return <span className={`badge badge-severity-${value}`}>{label}</span>;
}
