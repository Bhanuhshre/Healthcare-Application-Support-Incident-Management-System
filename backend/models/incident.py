import enum

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base


class IncidentSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class IncidentStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    application = relationship("Application", back_populates="incidents")

    severity = Column(Enum(IncidentSeverity), nullable=False, default=IncidentSeverity.MEDIUM)
    status = Column(Enum(IncidentStatus), nullable=False, default=IncidentStatus.OPEN)

    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reported_by = relationship("User", foreign_keys=[reported_by_id], back_populates="reported_incidents")

    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_incidents")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    comments = relationship("IncidentComment", back_populates="incident", cascade="all, delete-orphan")


class IncidentComment(Base):
    __tablename__ = "incident_comments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    incident = relationship("Incident", back_populates="comments")

    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", back_populates="comments")

    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
