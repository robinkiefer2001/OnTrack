from pydantic import BaseModel
from typing import Optional

class ProjectPhase(BaseModel):
    phaseid: Optional[int] = None
    projectID: int
    startDate: Optional[str] = None
    dueDate: Optional[str] = None
    phaseName: str
