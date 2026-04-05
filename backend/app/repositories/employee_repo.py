from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.schemas.employee import Employee as EmployeeSchema

def get_employee(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: EmployeeSchema):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, patch: dict):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return None
    for key, value in patch.items():
        setattr(db_employee, key, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if db_employee:
        db.delete(db_employee)
        db.commit()
    return db_employee