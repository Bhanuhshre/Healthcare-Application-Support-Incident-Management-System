from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.application import ApplicationStatus, ApplicationEnvironment


class ApplicationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_team: str
    environment: ApplicationEnvironment = ApplicationEnvironment.PRODUCTION
    status: ApplicationStatus = ApplicationStatus.OPERATIONAL


class ApplicationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_team: Optional[str] = None
    environment: Optional[ApplicationEnvironment] = None
    status: Optional[ApplicationStatus] = None


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    owner_team: str
    environment: ApplicationEnvironment
    status: ApplicationStatus
    created_at: datetime
    open_incident_count: int = 0
