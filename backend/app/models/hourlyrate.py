from sqlalchemy import Column, Integer, String, Numeric, Boolean
from app.core.database import Base

class HourlyRate(Base):
    __tablename__ = "hourly_rates"

    rate_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False)
    rate_type = Column(String, nullable=False)
    hourly_rate = Column(Numeric, nullable=False)
    is_default = Column(Boolean, default=False)