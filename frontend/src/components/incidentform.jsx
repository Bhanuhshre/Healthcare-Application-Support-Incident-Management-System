import { useState } from "react";

const SEVERITIES = ["critical", "high", "medium", "low"];

export default function IncidentForm({ applications, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [applicationId, setApplicationId] = useState(applications[0]?.id || "");
  const [severity, setSeverity] = useState("medium");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !applicationId) {
      setError("Title, description, and application are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        application_id: Number(applicationId),
        severity,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="incident-title">Title</label>
        <input
          id="incident-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Short summary of the problem"
        />
      </div>

      <div className="form-field">
        <label htmlFor="incident-description">Description</label>
        <textarea
          id="incident-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is happening, who is affected, and any steps to reproduce"
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="incident-application">Application</label>
          <select
            id="incident-application"
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
          >
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="incident-severity">Severity</label>
          <select id="incident-severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
            {SEVERITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Reporting..." : "Report incident"}
        </button>
      </div>
    </form>
  );
}
