def test_register_creates_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Jordan Ellis",
            "username": "jellis",
            "email": "jellis@example.com",
            "password": "SecurePass123",
            "role": "support_agent",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "jellis"
    assert "hashed_password" not in data


def test_register_rejects_duplicate_username(client):
    payload = {
        "full_name": "Jordan Ellis",
        "username": "jellis",
        "email": "jellis@example.com",
        "password": "SecurePass123",
        "role": "support_agent",
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400


def test_login_returns_token(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Jordan Ellis",
            "username": "jellis",
            "email": "jellis@example.com",
            "password": "SecurePass123",
            "role": "support_agent",
        },
    )
    response = client.post(
        "/api/auth/login",
        data={"username": "jellis", "password": "SecurePass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_rejects_bad_password(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Jordan Ellis",
            "username": "jellis",
            "email": "jellis@example.com",
            "password": "SecurePass123",
            "role": "support_agent",
        },
    )
    response = client.post(
        "/api/auth/login",
        data={"username": "jellis", "password": "WrongPassword"},
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testadmin"
