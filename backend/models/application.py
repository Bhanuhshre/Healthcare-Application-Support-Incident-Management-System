import enum

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base


class ApplicationStatus(str, enum.Enum):
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    DOWN = "down"
    MAINTENANCE = "maintenance"


class ApplicationEnvironment(str, enum.Enum):
    PRODUCTION = "production"
    STAGING = "staging"
    TEST = "test"


class Application(Base):
    """
    Represents a healthcare software system that support incidents can be
    raised against, e.g. an EHR module, a patient portal, or a billing system.
    """

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_team = Column(String(150), nullable=False)
    environment = Column(Enum(ApplicationEnvironment), nullable=False, default=ApplicationEnvironment.PRODUCTION)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.OPERATIONAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    incidents = relationship("Incident", back_populates="application", cascade="all, delete-orphan")
