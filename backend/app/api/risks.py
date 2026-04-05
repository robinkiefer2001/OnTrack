from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.risk import ProjectRisk
from app.services import risk_service
from app.core.database import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[ProjectRisk])
def read_risks(db: Session = Depends(get_db)):
    return risk_service.get_all_risks(db)

@router.get("/{risk_id}", response_model=ProjectRisk)
def read_risk(risk_id: int, db: Session = Depends(get_db)):
    risk = risk_service.get_risk_by_id(db, risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk

@router.post("/", response_model=ProjectRisk)
def create_risk(risk: ProjectRisk, db: Session = Depends(get_db)):
    return risk_service.create_new_risk(db, risk)

@router.patch("/{risk_id}", response_model=ProjectRisk)
def update_risk(risk_id: int, patch: dict, db: Session = Depends(get_db)):
    updated = risk_service.update_risk(db, risk_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Risk not found")
    return updated

@router.delete("/{risk_id}")
def delete_risk(risk_id: int, db: Session = Depends(get_db)):
    deleted = risk_service.delete_risk(db, risk_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Risk not found")
    return {"ok": True}
