from fastapi import FastAPI
from app.api import projects, employees, tasks, customers, phases, risks, hourlyrates
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(phases.router, prefix="/api/phases", tags=["phases"])
app.include_router(risks.router, prefix="/api/risks", tags=["risks"])
app.include_router(hourlyrates.router, prefix="/api/hourlyrates", tags=["hourlyrates"])

@app.get("/")
def root():
    return {"msg": "OnTrack FastAPI backend running"}
