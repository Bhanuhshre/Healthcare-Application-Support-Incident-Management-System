from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import incident_service

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Aggregate figures for the main dashboard: counts broken down by status
    and severity, per-application incident totals, and the average time
    it takes to resolve an incident, in hours.
    """
    return {
        "by_status": incident_service.counts_by_status(db),
        "by_severity": incident_service.counts_by_severity(db),
        "by_application": incident_service.counts_by_application(db),
        "average_resolution_hours": incident_service.average_resolution_hours(db),
    }
