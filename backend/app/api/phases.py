from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.phase import ProjectPhase
from app.services import phase_service
from app.core.database import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[ProjectPhase])
def read_phases(db: Session = Depends(get_db)):
    return phase_service.get_all_phases(db)

@router.get("/{phase_id}", response_model=ProjectPhase)
def read_phase(phase_id: int, db: Session = Depends(get_db)):
    phase = phase_service.get_phase_by_id(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    return phase

@router.post("/", response_model=ProjectPhase)
def create_phase(phase: ProjectPhase, db: Session = Depends(get_db)):
    return phase_service.create_new_phase(db, phase)

@router.patch("/{phase_id}", response_model=ProjectPhase)
def update_phase(phase_id: int, patch: dict, db: Session = Depends(get_db)):
    updated = phase_service.update_phase(db, phase_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Phase not found")
    return updated

@router.delete("/{phase_id}")
def delete_phase(phase_id: int, db: Session = Depends(get_db)):
    deleted = phase_service.delete_phase(db, phase_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Phase not found")
    return {"ok": True}
