from sqlalchemy.orm import Session
from app.repositories import phase_repo
from app.schemas.phase import ProjectPhase

def get_all_phases(db: Session):
    return phase_repo.get_phases(db)

def get_phase_by_id(db: Session, phase_id: int):
    return phase_repo.get_phase(db, phase_id)

def create_new_phase(db: Session, phase: ProjectPhase):
    return phase_repo.create_phase(db, phase)

def update_phase(db: Session, phase_id: int, patch: dict):
    return phase_repo.update_phase(db, phase_id, patch)

def delete_phase(db: Session, phase_id: int):
    return phase_repo.delete_phase(db, phase_id)
