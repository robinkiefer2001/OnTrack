from pydantic import BaseModel
from typing import Optional

class Customer(BaseModel):
    customerID: int
    companyName: str
    contactName: str
    email: str
    phone: str
    zip: int
