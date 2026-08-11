import { useState } from "react";

const ENVIRONMENTS = ["production", "staging", "test"];
const STATUSES = ["operational", "degraded", "down", "maintenance"];

export default function ApplicationForm({ initial, onSubmit, onCancel, submitLabel = "Save" }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [ownerTeam, setOwnerTeam] = useState(initial?.owner_team || "");
  const [environment, setEnvironment] = useState(initial?.environment || "production");
  const [status, setStatus] = useState(initial?.status || "operational");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !ownerTeam.trim()) {
      setError("Name and owner team are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        owner_team: ownerTeam.trim(),
        environment,
        status,
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
        <label htmlFor="app-name">Application name</label>
        <input
          id="app-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Patient Portal"
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-description">Description</label>
        <textarea
          id="app-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What does this application do, and who uses it?"
          rows={3}
        />
      </div>

      <div className="form-field">
        <label htmlFor="app-owner">Owner team</label>
        <input
          id="app-owner"
          type="text"
          value={ownerTeam}
          onChange={(event) => setOwnerTeam(event.target.value)}
          placeholder="e.g. Digital Health Team"
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="app-environment">Environment</label>
          <select id="app-environment" value={environment} onChange={(event) => setEnvironment(event.target.value)}>
            {ENVIRONMENTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="app-status">Status</label>
          <select id="app-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((option) => (
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
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
