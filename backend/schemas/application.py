import enum

from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SUPPORT_AGENT = "support_agent"
    VIEWER = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reported_incidents = relationship(
        "Incident", foreign_keys="Incident.reported_by_id", back_populates="reported_by"
    )
    assigned_incidents = relationship(
        "Incident", foreign_keys="Incident.assigned_to_id", back_populates="assigned_to"
    )
    comments = relationship("IncidentComment", back_populates="author")
