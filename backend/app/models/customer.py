from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    contact_name = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    zip = Column(Integer)