from sqlalchemy.orm import Session
from app.repositories import hourlyrate_repo
from app.schemas.hourlyrate import HourlyRate

def get_all_hourlyrates(db: Session):
    return hourlyrate_repo.get_hourlyrates(db)

def get_hourlyrate_by_id(db: Session, rate_id: int):
    return hourlyrate_repo.get_hourlyrate(db, rate_id)

def create_new_hourlyrate(db: Session, rate: HourlyRate):
    return hourlyrate_repo.create_hourlyrate(db, rate)

def update_hourlyrate(db: Session, rate_id: int, patch: dict):
    return hourlyrate_repo.update_hourlyrate(db, rate_id, patch)

def delete_hourlyrate(db: Session, rate_id: int):
    return hourlyrate_repo.delete_hourlyrate(db, rate_id)
