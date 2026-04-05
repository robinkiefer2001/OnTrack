from sqlalchemy.orm import Session
from app.repositories import project_repo
from app.schemas.project import ProjectCreate

def get_all_projects(db: Session):
    return project_repo.get_projects(db)

def get_project_by_id(db: Session, project_id: int):
    return project_repo.get_project(db, project_id)

def create_new_project(db: Session, project: ProjectCreate):
    return project_repo.create_project(db, project)

def update_project(db: Session, project_id: int, patch: dict):
    return project_repo.update_project(db, project_id, patch)

def delete_project(db: Session, project_id: int):
    return project_repo.delete_project(db, project_id)