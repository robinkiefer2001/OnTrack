from sqlalchemy.orm import Session
from app.models.phase import ProjectPhase
from app.schemas.phase import ProjectPhase as ProjectPhaseSchema

def get_phase(db: Session, phase_id: int):
    return db.query(ProjectPhase).filter(ProjectPhase.phaseid == phase_id).first()

def get_phases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ProjectPhase).offset(skip).limit(limit).all()

def create_phase(db: Session, phase: ProjectPhaseSchema):
    db_phase = ProjectPhase(**phase.dict())
    db.add(db_phase)
    db.commit()
    db.refresh(db_phase)
    return db_phase

def update_phase(db: Session, phase_id: int, patch: dict):
    db_phase = get_phase(db, phase_id)
    if not db_phase:
        return None
    for key, value in patch.items():
        setattr(db_phase, key, value)
    db.commit()
    db.refresh(db_phase)
    return db_phase

def delete_phase(db: Session, phase_id: int):
    db_phase = get_phase(db, phase_id)
    if db_phase:
        db.delete(db_phase)
        db.commit()
    return db_phase
