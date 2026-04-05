from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.employee import Employee
from app.services import employee_service
from app.core.database import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Employee])
def read_employees(db: Session = Depends(get_db)):
    return employee_service.get_all_employees(db)

@router.get("/{employee_id}", response_model=Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = employee_service.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/", response_model=Employee)
def create_employee(employee: Employee, db: Session = Depends(get_db)):
    return employee_service.create_new_employee(db, employee)

@router.patch("/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, patch: dict, db: Session = Depends(get_db)):
    updated = employee_service.update_employee(db, employee_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = employee_service.delete_employee(db, employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"ok": True}
