from sqlalchemy import Column, Integer, String, Date, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    phase_id = Column(Integer, ForeignKey("project_phases.phase_id"))
    title = Column(String, nullable=False)
    description = Column(String)
    project_phase = Column(String)
    status = Column(String)
    assigned_to = Column(String)
    start_date = Column(Date)
    due_date = Column(Date)
    notification_sent = Column(Boolean)
    estimated_hours = Column(Numeric)
    hourly_rate_type = Column(String)
    is_critical = Column(Boolean)
    risk_note = Column(String)
    created_at = Column(String)