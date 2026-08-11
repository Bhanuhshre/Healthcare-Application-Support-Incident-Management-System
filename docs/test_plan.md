# Test Plan

## Approach

Automated tests cover the backend API directly, since it enforces every
business rule (role permissions, status transitions, filtering) and the
frontend is a thin client on top of it. The backend suite runs against a
real SQLite database file per test session rather than mocks, so the tests
exercise actual SQL, not a stand-in.

Run the suite with:

```
cd backend
pip install -r requirements.txt
pytest -q
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs this suite,
plus a frontend production build, on every push and pull request against
`main`.

## Automated test coverage

### Authentication (`backend/tests/test_auth.py`)

| Case | What it checks |
|---|---|
| Register creates a user | Response is 201 and the password hash is never returned to the client |
| Register rejects a duplicate username | Second registration with the same username returns 400 |
| Login returns a token | Valid credentials produce an access token |
| Login rejects a bad password | Wrong password returns 401 |
| `/auth/me` requires a token | Unauthenticated request returns 401 |
| `/auth/me` returns the current user | Authenticated request returns the logged-in user's profile |

### Applications and incidents (`backend/tests/test_incidents.py`)

| Case | What it checks |
|---|---|
| Create an application | Application is created and returned with an id |
| Create an incident | Incident defaults to status "open" and keeps the requested severity |
| Update incident status to resolved | `resolved_at` is populated once status becomes resolved |
| Filter incidents by severity | Query parameter narrows results to the matching severity only |
| Add a comment to an incident | Comment is stored and returned with its body |
| Reports summary | Status and severity counts reflect the incidents created in the test |

## Manual test checklist

Automated coverage focuses on the API. Before a release, walk through the
following in the running application:

1. Register a viewer account, confirm it cannot see a "Report incident"
   or "Add application" button anywhere in the interface.
2. Register a support agent account, create an application, then report
   an incident against it, and confirm it appears on the dashboard and
   incidents list.
3. Change an incident's status from open through to resolved and confirm
   the "Resolved at" timestamp appears on the detail page.
4. Log in as an administrator and confirm the delete controls for
   applications and incidents are visible only to that role.
5. Log out and confirm protected pages redirect to the login screen.
6. Resize the browser window to a narrow width and confirm the layout
   remains usable (the detail page should stack into a single column).

## Known gaps

- There is no automated end-to-end (browser) test suite covering the
  React frontend; the manual checklist above is the current substitute.
- Concurrent-edit conflicts (two agents updating the same incident at
  once) are resolved on a last-write-wins basis and are not explicitly
  tested.
