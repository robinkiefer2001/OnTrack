from pydantic import BaseModel

class HourlyRate(BaseModel):
    rateID: int
    rateType: str
    hourlyRate: float
    isDefault: bool
