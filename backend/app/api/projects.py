from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.project import Project, ProjectCreate
from app.services import project_service
from app.core.database import SessionLocal
from app.core.auth import get_current_user
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Project])
def read_projects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Beispiel: Zugriff nur, wenn User für Tenant eine Rolle hat
    if not user["tenants"]:
        raise HTTPException(status_code=403, detail="No tenant access")
    return project_service.get_all_projects(db)

@router.get("/{project_id}", response_model=Project)
def read_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = project_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Optional: Tenant-Check
    return project

@router.post("/", response_model=Project)
def create_project(project: ProjectCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Beispiel: Nur Admins dürfen Projekte anlegen
    if "admin" not in user["tenants"].values():
        raise HTTPException(status_code=403, detail="Not allowed")
    return project_service.create_new_project(db, project)

@router.patch("/{project_id}", response_model=Project)
def update_project(project_id: int, patch: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    updated = project_service.update_project(db, project_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    deleted = project_service.delete_project(db, project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}
