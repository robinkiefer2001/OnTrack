from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import Task as TaskSchema

def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.task_id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Task).offset(skip).limit(limit).all()

def create_task(db: Session, task: TaskSchema):
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, patch: dict):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    for key, value in patch.items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task