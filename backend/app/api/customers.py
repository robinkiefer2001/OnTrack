from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.customer import Customer
from app.services import customer_service
from app.core.database import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Customer])
def read_customers(db: Session = Depends(get_db)):
    return customer_service.get_all_customers(db)

@router.get("/{customer_id}", response_model=Customer)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = customer_service.get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=Customer)
def create_customer(customer: Customer, db: Session = Depends(get_db)):
    return customer_service.create_new_customer(db, customer)

@router.patch("/{customer_id}", response_model=Customer)
def update_customer(customer_id: int, patch: dict, db: Session = Depends(get_db)):
    updated = customer_service.update_customer(db, customer_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    deleted = customer_service.delete_customer(db, customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"ok": True}
