# Troubleshooting

## Backend will not start: "connection to server ... failed"

The backend cannot reach PostgreSQL. Check that:

- The `db` container is healthy: `docker compose ps` should show it as
  "healthy", not just "running".
- `DATABASE_URL` points at the right host. Inside docker-compose it should
  be `db`, not `localhost`, since each service runs in its own container.
- If you are running the backend outside of Docker against a local
  Postgres install, confirm Postgres is actually listening on port 5432
  with `pg_isready`.

## Login fails with "Incorrect username or password" even though the account exists

- Usernames are case-sensitive. Confirm the exact username used at
  registration.
- If the account was seeded directly through `database/schema.sql`, its
  password is `ChangeMe123`. Change it after first login by re-registering
  or updating the record; there is no self-service "forgot password" flow
  in this version.

## Frontend shows a blank page after logging in

- Open the browser console. A common cause is the frontend calling the API
  at the wrong base URL. In development, Vite proxies `/api` to
  `http://localhost:8000` (see `frontend/vite.config.js`); confirm the
  backend is actually running on port 8000.
- Confirm the token is present: in the browser console run
  `localStorage.getItem("haism_token")`. If it is `null`, the login
  response was not stored, which usually means the login request itself
  failed silently; check the Network tab for the actual response.

## "email-validator is not installed" when starting the backend

The `pydantic[email]` extra is required for validating email addresses on
registration. It is listed in `backend/requirements.txt` as
`email-validator`; if you installed dependencies from an old lock file or
cache, reinstall with:

```
pip install -r backend/requirements.txt
```

## CORS errors in the browser console

The backend only allows requests from the origins listed in the
`CORS_ORIGINS` environment variable. If you are serving the frontend from
a different host or port than `http://localhost:5173` (development) or
`http://localhost` (docker-compose), add that origin to `CORS_ORIGINS` in
your `.env` file and restart the backend.

## Incident status will not change

Only support agents and administrators can change incident status; a
viewer account will see a read-only status badge instead of a dropdown.
If you are logged in as a support agent or administrator and the dropdown
is still missing, confirm the account's role by checking
`GET /api/auth/me` directly, since a stale frontend session can sometimes
show outdated role information until you log out and back in.

## Tests fail locally with a bcrypt version error

Some combinations of `passlib` and newer `bcrypt` releases are
incompatible. This project pins `bcrypt==4.0.1` in
`backend/requirements.txt` specifically to avoid this; if you see a
`password cannot be longer than 72 bytes` or `module 'bcrypt' has no
attribute '__about__'` error, reinstall dependencies from a clean virtual
environment rather than upgrading `bcrypt` independently.

## Docker build fails on the frontend with a native module error

Delete `frontend/node_modules` and `frontend/package-lock.json` if they
exist locally before building the Docker image; a lockfile generated on a
different OS/architecture than the build container can pull in
incompatible native binaries for tools like esbuild.
