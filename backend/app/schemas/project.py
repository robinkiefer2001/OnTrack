from pydantic import BaseModel
from typing import Optional

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    tenant_id: str
    customer_id: Optional[int] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    budget: Optional[float] = None
    project_manager: Optional[str] = None
    status: Optional[str] = None
    created_by: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    project_id: int
    created_at: Optional[str] = None

    class Config:
        orm_mode = True
