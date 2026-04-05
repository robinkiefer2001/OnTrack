from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    employee_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"))
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    phone = Column(String)
    job_title = Column(String)
    department = Column(String)
    role = Column(String)
    start_date = Column(Date)