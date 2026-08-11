def _create_application(client, auth_headers, name="Patient Portal"):
    response = client.post(
        "/api/applications",
        json={
            "name": name,
            "description": "Public patient facing portal",
            "owner_team": "Digital Health Team",
            "environment": "production",
            "status": "operational",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_create_application(client, auth_headers):
    app_id = _create_application(client, auth_headers)
    assert app_id is not None


def test_create_incident(client, auth_headers):
    app_id = _create_application(client, auth_headers)
    response = client.post(
        "/api/incidents",
        json={
            "title": "Patients cannot reset their password",
            "description": "Password reset emails are not being delivered.",
            "application_id": app_id,
            "severity": "high",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "open"
    assert data["severity"] == "high"


def test_update_incident_status_sets_resolved_at(client, auth_headers):
    app_id = _create_application(client, auth_headers)
    create_response = client.post(
        "/api/incidents",
        json={
            "title": "Lab results not syncing",
            "description": "Lab results integration is failing silently.",
            "application_id": app_id,
            "severity": "critical",
        },
        headers=auth_headers,
    )
    incident_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/incidents/{incident_id}",
        json={"status": "resolved"},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["status"] == "resolved"
    assert data["resolved_at"] is not None


def test_filter_incidents_by_severity(client, auth_headers):
    app_id = _create_application(client, auth_headers)
    client.post(
        "/api/incidents",
        json={
            "title": "Minor UI glitch",
            "description": "A button label is misaligned on small screens.",
            "application_id": app_id,
            "severity": "low",
        },
        headers=auth_headers,
    )
    client.post(
        "/api/incidents",
        json={
            "title": "Appointment booking is down",
            "description": "Users cannot book new appointments.",
            "application_id": app_id,
            "severity": "critical",
        },
        headers=auth_headers,
    )

    response = client.get("/api/incidents", params={"severity": "critical"}, headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["severity"] == "critical"


def test_add_comment_to_incident(client, auth_headers):
    app_id = _create_application(client, auth_headers)
    create_response = client.post(
        "/api/incidents",
        json={
            "title": "Billing export fails",
            "description": "Monthly billing export job throws an error.",
            "application_id": app_id,
            "severity": "medium",
        },
        headers=auth_headers,
    )
    incident_id = create_response.json()["id"]

    comment_response = client.post(
        f"/api/incidents/{incident_id}/comments",
        json={"body": "Investigating the export job logs now."},
        headers=auth_headers,
    )
    assert comment_response.status_code == 201
    assert comment_response.json()["body"] == "Investigating the export job logs now."


def test_reports_summary(client, auth_headers):
    app_id = _create_application(client, auth_headers)
    client.post(
        "/api/incidents",
        json={
            "title": "Scheduling conflict bug",
            "description": "Double bookings are appearing for the same slot.",
            "application_id": app_id,
            "severity": "high",
        },
        headers=auth_headers,
    )

    response = client.get("/api/reports/summary", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["by_status"]["open"] == 1
    assert data["by_severity"]["high"] == 1
