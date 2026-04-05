from sqlalchemy.orm import Session
from app.repositories import task_repo
from app.schemas.task import Task

def get_all_tasks(db: Session):
    return task_repo.get_tasks(db)

def get_task_by_id(db: Session, task_id: int):
    return task_repo.get_task(db, task_id)

def create_new_task(db: Session, task: Task):
    return task_repo.create_task(db, task)

def update_task(db: Session, task_id: int, patch: dict):
    return task_repo.update_task(db, task_id, patch)

def delete_task(db: Session, task_id: int):
    return task_repo.delete_task(db, task_id)