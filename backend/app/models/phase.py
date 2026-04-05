from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.core.database import Base

class ProjectPhase(Base):
    __tablename__ = "project_phases"

    phase_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    phase_name = Column(String, nullable=False)
    start_date = Column(Date)
    due_date = Column(Date)