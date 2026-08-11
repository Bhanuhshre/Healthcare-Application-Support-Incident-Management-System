import { useEffect, useState } from "react";
import { listApplications, createApplication, deleteApplication } from "../api/applications";
import { StatusBadge } from "../components/StatusBadge";
import ApplicationForm from "../components/ApplicationForm";
import { useAuth } from "../context/AuthContext";

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const canManage = user && (user.role === "admin" || user.role === "support_agent");
  const canDelete = user && user.role === "admin";

  async function load() {
    setLoading(true);
    try {
      const data = await listApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload) {
    await createApplication(payload);
    setShowForm(false);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this application and all of its incidents?")) {
      return;
    }
    try {
      await deleteApplication(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p className="page-subtitle">The systems this team supports, and their current health.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "Add application"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <h2>Add a new application</h2>
          </div>
          <ApplicationForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Create application" />
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="panel">
        {loading ? (
          <div className="page-loading">Loading applications...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner team</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Open incidents</th>
                {canDelete && <th></th>}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="app-name">{app.name}</div>
                    {app.description && <div className="app-description">{app.description}</div>}
                  </td>
                  <td>{app.owner_team}</td>
                  <td>{app.environment}</td>
                  <td>
                    <StatusBadge value={app.status} />
                  </td>
                  <td>{app.open_incident_count}</td>
                  {canDelete && (
                    <td>
                      <button className="btn btn-ghost btn-small" onClick={() => handleDelete(app.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
