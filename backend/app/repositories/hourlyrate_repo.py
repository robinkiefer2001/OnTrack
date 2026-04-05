from sqlalchemy.orm import Session
from app.models.hourlyrate import HourlyRate
from app.schemas.hourlyrate import HourlyRate as HourlyRateSchema

def get_hourlyrate(db: Session, rate_id: int):
    return db.query(HourlyRate).filter(HourlyRate.rateID == rate_id).first()

def get_hourlyrates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(HourlyRate).offset(skip).limit(limit).all()

def create_hourlyrate(db: Session, rate: HourlyRateSchema):
    db_rate = HourlyRate(**rate.dict())
    db.add(db_rate)
    db.commit()
    db.refresh(db_rate)
    return db_rate

def update_hourlyrate(db: Session, rate_id: int, patch: dict):
    db_rate = get_hourlyrate(db, rate_id)
    if not db_rate:
        return None
    for key, value in patch.items():
        setattr(db_rate, key, value)
    db.commit()
    db.refresh(db_rate)
    return db_rate

def delete_hourlyrate(db: Session, rate_id: int):
    db_rate = get_hourlyrate(db, rate_id)
    if db_rate:
        db.delete(db_rate)
        db.commit()
    return db_rate
