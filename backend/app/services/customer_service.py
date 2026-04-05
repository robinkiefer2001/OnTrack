from sqlalchemy.orm import Session
from app.repositories import customer_repo
from app.schemas.customer import Customer

def get_all_customers(db: Session):
    return customer_repo.get_customers(db)

def get_customer_by_id(db: Session, customer_id: int):
    return customer_repo.get_customer(db, customer_id)

def create_new_customer(db: Session, customer: Customer):
    return customer_repo.create_customer(db, customer)

def update_customer(db: Session, customer_id: int, patch: dict):
    return customer_repo.update_customer(db, customer_id, patch)

def delete_customer(db: Session, customer_id: int):
    return customer_repo.delete_customer(db, customer_id)