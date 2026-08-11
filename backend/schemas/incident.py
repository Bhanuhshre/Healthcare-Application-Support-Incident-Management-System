from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from app.models.incident import IncidentSeverity, IncidentStatus
from app.schemas.user import UserOut


class IncidentCreate(BaseModel):
    title: str
    description: str
    application_id: int
    severity: IncidentSeverity = IncidentSeverity.MEDIUM


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[IncidentSeverity] = None
    status: Optional[IncidentStatus] = None
    assigned_to_id: Optional[int] = None


class CommentCreate(BaseModel):
    body: str


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    body: str
    created_at: datetime
    author: UserOut


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    application_id: int
    severity: IncidentSeverity
    status: IncidentStatus
    reported_by: UserOut
    assigned_to: Optional[UserOut]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]


class IncidentDetailOut(IncidentOut):
    comments: List[CommentOut] = []
