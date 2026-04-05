from pydantic import BaseModel

class ProjectRisk(BaseModel):
    id: str
    title: str
    impact: str
    probability: str
    mitigation: str
    isOpen: bool
