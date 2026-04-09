
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routes import employees, departments, positions, payroll, attendance, reports, alerts
app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(positions.router)
app.include_router(payroll.router)
app.include_router(attendance.router)
app.include_router(reports.router)
app.include_router(alerts.router)