from sqlalchemy.orm import Session
from app.models.risk import ProjectRisk
from app.schemas.risk import ProjectRisk as ProjectRiskSchema

def get_risk(db: Session, risk_id: int):
    return db.query(ProjectRisk).filter(ProjectRisk.id == risk_id).first()

def get_risks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ProjectRisk).offset(skip).limit(limit).all()

def create_risk(db: Session, risk: ProjectRiskSchema):
    db_risk = ProjectRisk(**risk.dict())
    db.add(db_risk)
    db.commit()
    db.refresh(db_risk)
    return db_risk

def update_risk(db: Session, risk_id: int, patch: dict):
    db_risk = get_risk(db, risk_id)
    if not db_risk:
        return None
    for key, value in patch.items():
        setattr(db_risk, key, value)
    db.commit()
    db.refresh(db_risk)
    return db_risk

def delete_risk(db: Session, risk_id: int):
    db_risk = get_risk(db, risk_id)
    if db_risk:
        db.delete(db_risk)
        db.commit()
    return db_risk
