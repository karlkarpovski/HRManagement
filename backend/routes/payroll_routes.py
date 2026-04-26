from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from database import get_payroll_db, get_both_dbs
from services.payroll_service import PayrollService
from schemas.schemas import PayrollGenerateRequest, PayrollGenerateResponse

router = APIRouter(prefix="/api/payroll", tags=["Payroll"])


@router.get("/salaries")
def get_salaries(
    employee_id:  Optional[int]  = None,
    salary_month: Optional[date] = None,
    page:         int = Query(1, ge=1),
    page_size:    int = Query(10, le=100, ge=1),
    payroll_db: Session = Depends(get_payroll_db),
):
    return PayrollService.get_salary_records(payroll_db, employee_id, salary_month, page, page_size)


@router.post("/generate", response_model=PayrollGenerateResponse)
def generate_payroll(
    request: PayrollGenerateRequest,
    dbs:     tuple = Depends(get_both_dbs),
):
    hr_db, payroll_db = dbs
    return PayrollService.generate_payroll(hr_db, payroll_db, request)


@router.get("/attendance")
def get_attendance(
    employee_id: Optional[int]  = None,
    month:       Optional[date] = None,
    payroll_db:  Session = Depends(get_payroll_db),
):
    return PayrollService.get_attendance_records(payroll_db, employee_id, month)


@router.get("/employee/{employee_id}/profile")
def get_payroll_profile(employee_id: int, payroll_db: Session = Depends(get_payroll_db)):
    profile = PayrollService.get_employee_payroll_profile(payroll_db, employee_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Payroll profile not found")
    return {
        "EmployeeID":   profile.EmployeeID,
        "FullName":     profile.FullName,
        "DepartmentID": profile.DepartmentID,
        "PositionID":   profile.PositionID,
        "Status":       profile.Status,
        "SyncedAt":     profile.SyncedAt,
    }