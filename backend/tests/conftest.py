import os
import tempfile

import pytest

# Point the application at a throwaway sqlite file before anything under
# app/ is imported, so app.database.session builds its engine against it
# instead of the default PostgreSQL URL.
_db_fd, _db_path = tempfile.mkstemp(suffix=".sqlite")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"
os.environ["SECRET_KEY"] = "test-secret-key"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.database.session import Base, engine  # noqa: E402


@pytest.fixture(autouse=True)
def _reset_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def auth_headers(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Test Admin",
            "username": "testadmin",
            "email": "testadmin@example.com",
            "password": "SecurePass123",
            "role": "admin",
        },
    )
    response = client.post(
        "/api/auth/login",
        data={"username": "testadmin", "password": "SecurePass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
