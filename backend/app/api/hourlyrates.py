from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.hourlyrate import HourlyRate
from app.services import hourlyrate_service
from app.core.database import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[HourlyRate])
def read_hourlyrates(db: Session = Depends(get_db)):
    return hourlyrate_service.get_all_hourlyrates(db)

@router.get("/{rate_id}", response_model=HourlyRate)
def read_hourlyrate(rate_id: int, db: Session = Depends(get_db)):
    rate = hourlyrate_service.get_hourlyrate_by_id(db, rate_id)
    if not rate:
        raise HTTPException(status_code=404, detail="HourlyRate not found")
    return rate

@router.post("/", response_model=HourlyRate)
def create_hourlyrate(rate: HourlyRate, db: Session = Depends(get_db)):
    return hourlyrate_service.create_new_hourlyrate(db, rate)

@router.patch("/{rate_id}", response_model=HourlyRate)
def update_hourlyrate(rate_id: int, patch: dict, db: Session = Depends(get_db)):
    updated = hourlyrate_service.update_hourlyrate(db, rate_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="HourlyRate not found")
    return updated

@router.delete("/{rate_id}")
def delete_hourlyrate(rate_id: int, db: Session = Depends(get_db)):
    deleted = hourlyrate_service.delete_hourlyrate(db, rate_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="HourlyRate not found")
    return {"ok": True}
