from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    title = Column(String, nullable=False)
    description = Column(String)
    start_date = Column(Date)
    due_date = Column(Date)
    budget = Column(Numeric)
    project_manager = Column(String)
    status = Column(String)
    created_by = Column(String)
    created_at = Column(String)

    # Beispiel für Beziehung
    # customer = relationship("Customer", back_populates="projects")