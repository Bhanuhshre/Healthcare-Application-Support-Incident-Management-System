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

## Quick start with Docker Compose

```
cp .env.example .env
```

Open `.env` and set `SECRET_KEY` to a real random value, for example the
output of `openssl rand -hex 32`. Then:

```
docker compose up --build
```

The first run pulls base images and builds two containers, so it can take
a few minutes. Watch the terminal output rather than opening the browser
right away - you're looking for lines indicating the backend is listening
on port 8000 and nginx has started in the frontend container.

### Confirm it actually started before opening a browser

In a second terminal, from the project root:

```
docker compose ps
```

All three services (`db`, `backend`, `frontend`) should show as `running`
or `healthy`. If any of them show `Exit` or don't appear, that container
crashed - check its logs before touching the browser:

```
docker compose logs backend
docker compose logs frontend
```

Once `docker compose ps` looks healthy, test the backend directly first,
since it has no build step and is the simplest thing to reach:

```
curl http://localhost:8000/api/health
```

That should return `{"status":"ok",...}`. If it doesn't, Docker's port
mapping isn't reaching your host - see the troubleshooting section below
before assuming anything is wrong with the application code itself.

Once the backend responds, open:

- Frontend: http://localhost
- Backend API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs

Register an account from the frontend's registration page to get started,
or provision the seeded administrator account by running
`database/schema.sql` against the database (username `admin`, password
`ChangeMe123` - change it immediately in any real deployment).

## If http://localhost doesn't load

This is almost always one of these, in order of likelihood:

1. **The frontend container is still building.** The frontend Dockerfile
   runs a full `npm install` and production build inside the image before
   nginx ever starts. `docker compose ps` will show it as `running` only
   once that finishes.
2. **Port 80 is already taken on your machine** by another local web
   server or container. Change the mapping in `docker-compose.yml` from
   `"80:80"` to something like `"8080:80"` and use http://localhost:8080
   instead.
3. **The build failed silently.** Check `docker compose logs frontend` for
   an npm error - if the build step failed, nginx has nothing to serve and
   the port simply won't respond, which looks identical to "page can't be
   reached" in the browser.

Full details are in `docs/TROUBLESHOOTING.md`.

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

The backend creates its tables automatically on startup if they don't
already exist. You'll need a PostgreSQL instance running locally and
reachable at the URL above - `docker compose up db` on its own will start
just the database if you don't want the rest of the stack.

## Running the frontend locally without Docker

```
cd frontend
npm install
npm run dev
```

This starts a dev server on http://localhost:5173 and proxies `/api`
requests to a backend running on http://localhost:8000. This is generally
faster to iterate on than rebuilding the Docker image on every change.

## Running the backend tests

```
cd backend
pip install -r requirements.txt
pytest -q
```

The suite runs against a throwaway SQLite database file, so it does not
require PostgreSQL to be running.

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
- `docs/TROUBLESHOOTING.md` - fixes for common setup problems, including
  the port and build issues covered above.
