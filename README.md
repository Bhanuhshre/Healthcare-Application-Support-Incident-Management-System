# Healthcare-Application-Support-Incident-Management-System

# Healthcare Application Support & Incident Management System

A support desk tool for healthcare IT teams: track the applications you
support, log incidents against them, work those incidents through to
resolution, and see the operational picture on a dashboard.

## What is in this repository

- `backend/` - FastAPI service exposing a JSON API for auth, applications,
  incidents, and reporting, backed by PostgreSQL through SQLAlchemy.
- `frontend/` - React single-page application (built with Vite) that
  consumes the API.
- `database/schema.sql` - raw PostgreSQL DDL matching the SQLAlchemy
  models, for teams who want to provision the schema without going
  through the application.
- `docs/` - requirements, test plan, and troubleshooting reference.
- `docker-compose.yml` - runs the database, backend, and frontend together.

## Running with Docker Compose

This is the fastest way to get the whole system up.

```
cp .env.example .env
# edit .env and set a real SECRET_KEY
docker compose up --build
```

Once the containers are healthy:

- Frontend: http://localhost
- Backend API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs

Register an account from the frontend's registration page to get started,
or provision the seeded administrator account by running
`database/schema.sql` against the database (username `admin`, password
`ChangeMe123` - change it immediately in any real deployment).

## Running the backend locally without Docker

```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL=postgresql://haism_user:haism_password@localhost:5432/haism_db
export SECRET_KEY=some-long-random-string

uvicorn app.main:app --reload
```

The backend will create its tables automatically on startup if they do
not already exist.

## Running the frontend locally without Docker

```
cd frontend
npm install
npm run dev
```

This starts a dev server on http://localhost:5173 and proxies `/api`
requests to a backend running on http://localhost:8000.

## Running the backend tests

```
cd backend
pip install -r requirements.txt
pytest -q
```

The suite runs against a throwaway SQLite database file, so it does not
require PostgreSQL to be running. See `docs/TEST_PLAN.md` for what each
test covers and a manual testing checklist for the frontend.

## Roles

- **Viewer** - read-only access to applications, incidents, and reports.
- **Support agent** - can report incidents, update status, assign work,
  and manage applications.
- **Administrator** - everything a support agent can do, plus deleting
  applications and incidents.

Roles are enforced by the API itself, not just hidden in the interface.

## Further reading

- `docs/REQUIREMENTS.md` - what the system does and why, by role.
- `docs/TEST_PLAN.md` - automated test coverage and a manual checklist.
- `docs/TROUBLESHOOTING.md` - fixes for common setup problems.
