from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentStatus, IncidentSeverity
from app.models.application import Application


# Statuses that are considered terminal for an incident's lifecycle.
CLOSED_STATUSES = {IncidentStatus.RESOLVED, IncidentStatus.CLOSED}


def apply_status_transition(incident: Incident, new_status: IncidentStatus) -> None:
    """
    Keeps the resolved_at timestamp consistent with the incident status.
    Moving into a closed status stamps resolved_at; moving back out of one
    clears it so the record does not lie about when it was actually fixed.
    """
    if new_status in CLOSED_STATUSES and incident.resolved_at is None:
        incident.resolved_at = datetime.utcnow()
    elif new_status not in CLOSED_STATUSES:
        incident.resolved_at = None

    incident.status = new_status


def filter_incidents(
    db: Session,
    application_id: Optional[int] = None,
    status: Optional[IncidentStatus] = None,
    severity: Optional[IncidentSeverity] = None,
    assigned_to_id: Optional[int] = None,
):
    query = db.query(Incident)
    if application_id is not None:
        query = query.filter(Incident.application_id == application_id)
    if status is not None:
        query = query.filter(Incident.status == status)
    if severity is not None:
        query = query.filter(Incident.severity == severity)
    if assigned_to_id is not None:
        query = query.filter(Incident.assigned_to_id == assigned_to_id)
    return query.order_by(Incident.created_at.desc()).all()


def counts_by_status(db: Session) -> dict:
    rows = db.query(Incident.status, func.count(Incident.id)).group_by(Incident.status).all()
    return {status.value: count for status, count in rows}


def counts_by_severity(db: Session) -> dict:
    rows = db.query(Incident.severity, func.count(Incident.id)).group_by(Incident.severity).all()
    return {severity.value: count for severity, count in rows}


def counts_by_application(db: Session) -> list:
    rows = (
        db.query(Application.name, func.count(Incident.id))
        .join(Incident, Incident.application_id == Application.id, isouter=True)
        .group_by(Application.name)
        .all()
    )
    return [{"application": name, "incident_count": count} for name, count in rows]


def average_resolution_hours(db: Session) -> Optional[float]:
    resolved = (
        db.query(Incident)
        .filter(Incident.resolved_at.isnot(None))
        .all()
    )
    if not resolved:
        return None

    total_seconds = sum(
        (incident.resolved_at - incident.created_at).total_seconds() for incident in resolved
    )
    average_seconds = total_seconds / len(resolved)
    return round(average_seconds / 3600, 2)
