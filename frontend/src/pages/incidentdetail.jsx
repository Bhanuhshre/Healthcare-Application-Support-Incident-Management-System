import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getIncident, updateIncident, addComment, deleteIncident } from "../api/incidents";
import { getApplication } from "../api/applications";
import { StatusBadge, SeverityBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["open", "in_progress", "on_hold", "resolved", "closed"];

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

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [application, setApplication] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const canManage = user && (user.role === "admin" || user.role === "support_agent");

  async function load() {
    setLoading(true);
    try {
      const data = await getIncident(id);
      setIncident(data);
      const app = await getApplication(data.application_id);
      setApplication(app);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(event) {
    setUpdating(true);
    try {
      await updateIncident(id, { status: event.target.value });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      await addComment(id, comment.trim());
      setComment("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this incident permanently? This cannot be undone.")) {
      return;
    }
    try {
      await deleteIncident(id);
      navigate("/incidents");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="page-loading">Loading incident...</div>;
  }

  if (error && !incident) {
    return <div className="form-error">{error}</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{incident.title}</h1>
        <p className="page-subtitle">
          {application ? application.name : `Application #${incident.application_id}`} &middot; Reported by{" "}
          {incident.reported_by.full_name} on {formatDate(incident.created_at)}
        </p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Description</h2>
          </div>
          <p className="incident-description">{incident.description}</p>

          <div className="panel-header">
            <h2>Discussion</h2>
          </div>
          <div className="comment-list">
            {incident.comments.length === 0 && <p className="empty-state">No comments yet.</p>}
            {incident.comments.map((item) => (
              <div key={item.id} className="comment">
                <div className="comment-meta">
                  <span className="comment-author">{item.author.full_name}</span>
                  <span className="comment-date">{formatDate(item.created_at)}</span>
                </div>
                <p className="comment-body">{item.body}</p>
              </div>
            ))}
          </div>

          <form className="form" onSubmit={handleCommentSubmit}>
            <div className="form-field">
              <label htmlFor="comment-body">Add a comment</label>
              <textarea
                id="comment-body"
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share an update on this incident"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Post comment
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Details</h2>
          </div>
          <dl className="detail-list">
            <dt>Status</dt>
            <dd>
              {canManage ? (
                <select value={incident.status} onChange={handleStatusChange} disabled={updating}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge value={incident.status} />
              )}
            </dd>

            <dt>Severity</dt>
            <dd>
              <SeverityBadge value={incident.severity} />
            </dd>

            <dt>Assigned to</dt>
            <dd>{incident.assigned_to ? incident.assigned_to.full_name : "Unassigned"}</dd>

            <dt>Last updated</dt>
            <dd>{formatDate(incident.updated_at)}</dd>

            <dt>Resolved at</dt>
            <dd>{formatDate(incident.resolved_at)}</dd>
          </dl>

          {user && user.role === "admin" && (
            <button className="btn btn-danger btn-block" onClick={handleDelete}>
              Delete incident
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
