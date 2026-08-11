from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models.application import Application
from app.models.incident import Incident, IncidentStatus
from app.models.user import User, UserRole
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut

router = APIRouter(prefix="/api/applications", tags=["applications"])


def _with_open_incident_count(db: Session, application: Application) -> ApplicationOut:
    open_count = (
        db.query(Incident)
        .filter(
            Incident.application_id == application.id,
            Incident.status.notin_([IncidentStatus.RESOLVED, IncidentStatus.CLOSED]),
        )
        .count()
    )
    data = ApplicationOut.model_validate(application)
    data.open_incident_count = open_count
    return data


@router.get("", response_model=List[ApplicationOut])
def list_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    applications = db.query(Application).order_by(Application.name).all()
    return [_with_open_incident_count(db, app) for app in applications]


@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(
    application_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)),
):
    existing = db.query(Application).filter(Application.name == application_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="An application with this name already exists")

    application = Application(**application_in.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return _with_open_incident_count(db, application)


@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return _with_open_incident_count(db, application)


@router.put("/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: int,
    application_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in application_in.model_dump(exclude_unset=True).items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return _with_open_incident_count(db, application)


@router.delete("/{application_id}", status_code=204)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()
    return None

