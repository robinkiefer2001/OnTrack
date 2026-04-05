from pydantic import BaseModel
from typing import Optional, List

class Subtask(BaseModel):
    subtaskID: int
    taskID: int
    title: str
    description: str
    status: str
    assignedTo: str
    dueDate: Optional[str] = None
    startDate: Optional[str] = None
    estimatedHours: Optional[float] = None
    hourlyRateType: str
    isCritical: Optional[bool] = None
    riskNote: Optional[str] = None

class Task(BaseModel):
    taskID: int
    projectID: int
    phaseId: Optional[int] = None
    title: str
    description: str
    projectPhase: Optional[str] = None
    status: str
    assignedTo: str
    dueDate: Optional[str] = None
    startDate: Optional[str] = None
    notificationSent: bool
    estimatedHours: Optional[float] = None
    hourlyRateType: str
    isCritical: Optional[bool] = None
    riskNote: Optional[str] = None
    subtasks: List[Subtask] = []
