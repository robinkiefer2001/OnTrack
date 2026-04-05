from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS für lokale Entwicklung (Frontend auf anderem Port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Beispiel-Datenmodelle (Pydantic)
class Project(BaseModel):
    projectID: int
    title: str
    description: Optional[str] = None
    projectManager: str
    budget: Optional[float] = None
    startDate: Optional[str] = None
    dueDate: Optional[str] = None
    status: Optional[str] = None

class Employee(BaseModel):
    employeeID: int
    firstName: str
    lastName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None

# Beispiel-Endpunkte
@app.get("/api/projects", response_model=List[Project])
def get_projects():
    # TODO: DB-Anbindung
    return []

@app.get("/api/employees", response_model=List[Employee])
def get_employees():
    # TODO: DB-Anbindung
    return []
