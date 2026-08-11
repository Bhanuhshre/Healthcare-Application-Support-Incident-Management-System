from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models.application import Application
from app.models.incident import Incident, IncidentComment, IncidentStatus, IncidentSeverity
from app.models.user import User, UserRole
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentOut,
    IncidentDetailOut,
    CommentCreate,
    CommentOut,
)
from app.services import incident_service

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("", response_model=List[IncidentOut])
def list_incidents(
    application_id: Optional[int] = Query(default=None),
    status: Optional[IncidentStatus] = Query(default=None),
    severity: Optional[IncidentSeverity] = Query(default=None),
    assigned_to_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return incident_service.filter_incidents(
        db,
        application_id=application_id,
        status=status,
        severity=severity,
        assigned_to_id=assigned_to_id,
    )


@router.post("", response_model=IncidentOut, status_code=201)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = db.query(Application).filter(Application.id == incident_in.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    incident = Incident(
        title=incident_in.title,
        description=incident_in.description,
        application_id=incident_in.application_id,
        severity=incident_in.severity,
        reported_by_id=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=IncidentDetailOut)
def get_incident(incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.put("/{incident_id}", response_model=IncidentOut)
def update_incident(
    incident_id: int,
    incident_in: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_data = incident_in.model_dump(exclude_unset=True)

    if "assigned_to_id" in update_data:
        assignee_id = update_data.pop("assigned_to_id")
        if assignee_id is not None:
            assignee = db.query(User).filter(User.id == assignee_id).first()
            if not assignee:
                raise HTTPException(status_code=404, detail="Assigned user not found")
        incident.assigned_to_id = assignee_id

    if "status" in update_data:
        new_status = update_data.pop("status")
        incident_service.apply_status_transition(incident, new_status)

    for field, value in update_data.items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=204)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return None


@router.post("/{incident_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    incident_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    comment = IncidentComment(
        incident_id=incident_id,
        author_id=current_user.id,
        body=comment_in.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
