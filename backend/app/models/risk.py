from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.core.database import Base

class ProjectRisk(Base):
    __tablename__ = "project_risks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    title = Column(String, nullable=False)
    impact = Column(String)
    probability = Column(String)
    mitigation = Column(String)
    is_open = Column(Boolean, default=True)