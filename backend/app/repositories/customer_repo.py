from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import Customer as CustomerSchema

def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: CustomerSchema):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, patch: dict):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    for key, value in patch.items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer