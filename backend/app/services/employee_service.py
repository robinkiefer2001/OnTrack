from sqlalchemy.orm import Session
from app.repositories import employee_repo
from app.schemas.employee import Employee

def get_all_employees(db: Session):
    return employee_repo.get_employees(db)

def get_employee_by_id(db: Session, employee_id: int):
    return employee_repo.get_employee(db, employee_id)

def create_new_employee(db: Session, employee: Employee):
    return employee_repo.create_employee(db, employee)

def update_employee(db: Session, employee_id: int, patch: dict):
    return employee_repo.update_employee(db, employee_id, patch)

def delete_employee(db: Session, employee_id: int):
    return employee_repo.delete_employee(db, employee_id)