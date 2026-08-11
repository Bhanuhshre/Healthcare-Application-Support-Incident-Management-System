# Requirements

## Purpose

This system gives a healthcare IT support team a single place to track the
applications they support and the incidents raised against those
applications, from first report through to resolution.

## Users and roles

Three roles are supported. Permissions are enforced by the API, not just
hidden in the interface.

- **Administrator** - full access, including deleting applications and
  incidents, and managing accounts.
- **Support agent** - can create and update applications and incidents,
  change incident status, assign incidents, and comment.
- **Viewer** - read-only access to applications, incidents, and reports.
  Typically used by stakeholders who need visibility but do not work
  incidents directly.

## Functional requirements

### Authentication

- A new user can register with a full name, username, email, password, and
  requested role.
- A registered user can log in with a username and password and receive a
  time-limited session token.
- The API rejects requests without a valid token on any protected endpoint.

### Applications

- An application record has a name, description, owner team, environment
  (production, staging, or test), and a status (operational, degraded,
  down, or maintenance).
- Support agents and administrators can create and update applications.
- Only administrators can delete an application. Deleting an application
  also removes its incidents.
- Every application's open incident count is shown alongside its status so
  a viewer can spot a struggling system at a glance.

### Incidents

- Any authenticated user can report an incident against an application,
  giving a title, description, and severity (critical, high, medium, or
  low).
- An incident has a status that moves through open, in progress, on hold,
  resolved, and closed.
- Support agents and administrators can change status, reassign an
  incident to another user, and edit its details.
- Moving an incident into resolved or closed automatically records when
  that happened, so resolution time can be measured. Moving it back out of
  a closed state clears that timestamp.
- Any authenticated user can add a comment to an incident to leave an
  update for the rest of the team.
- Incidents can be filtered by application, status, severity, and assignee.
- Only administrators can permanently delete an incident.

### Reporting

- A summary report shows incident counts grouped by status and by
  severity, a per-application incident count, and the average time between
  an incident being reported and being resolved.
- The dashboard surfaces the same summary alongside the most recently
  reported incidents, so a user opening the system sees the current state
  of things immediately.

## Non-functional requirements

- The API is stateless; every request is authenticated with a bearer
  token, which allows the backend to be scaled horizontally.
- Passwords are never stored in plain text; they are hashed with bcrypt.
- The system is deployable with a single `docker-compose up`, and each
  service (database, backend, frontend) is independently containerized.
- The interface avoids decorative icons and imagery in favor of clear text
  labels, so it reads well for a clinical/operational audience and is not
  dependent on an icon font being available.

## Out of scope for this version

- Email or SMS notifications when an incident is created or updated.
- Multi-tenant support for more than one healthcare organization.
- Fine-grained, per-application permissions (roles are global, not scoped
  to individual applications).
- File attachments on incidents.
