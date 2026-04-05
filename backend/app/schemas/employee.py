from pydantic import BaseModel
from typing import Optional

class Employee(BaseModel):
    employeeID: int
    firstName: str
    lastName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
