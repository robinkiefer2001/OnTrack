from sqlalchemy.orm import Session
from app.repositories import risk_repo
from app.schemas.risk import ProjectRisk

def get_all_risks(db: Session):
    return risk_repo.get_risks(db)

def get_risk_by_id(db: Session, risk_id: int):
    return risk_repo.get_risk(db, risk_id)

def create_new_risk(db: Session, risk: ProjectRisk):
    return risk_repo.create_risk(db, risk)

def update_risk(db: Session, risk_id: int, patch: dict):
    return risk_repo.update_risk(db, risk_id, patch)

def delete_risk(db: Session, risk_id: int):
    return risk_repo.delete_risk(db, risk_id)
