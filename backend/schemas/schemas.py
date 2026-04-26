from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class DepartmentResponse(BaseModel):
    DepartmentID:   int
    DepartmentName: str
    CreatedAt:      Optional[datetime] = None
    UpdatedAt:      Optional[datetime] = None

    class Config:
        from_attributes = True


class PositionResponse(BaseModel):
    PositionID:   int
    PositionName: str
    CreatedAt:    Optional[datetime] = None
    UpdatedAt:    Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeCreate(BaseModel):
    FullName:     str
    DateOfBirth:  date
    HireDate:     date
    Gender:       Optional[str] = None
    PhoneNumber:  Optional[str] = None
    Email:        Optional[str] = None
    DepartmentID: Optional[int] = None
    PositionID:   Optional[int] = None
    Status:       Optional[str] = "Đang làm việc"


class EmployeeUpdate(BaseModel):
    FullName:     Optional[str]  = None
    DateOfBirth:  Optional[date] = None
    HireDate:     Optional[date] = None
    Gender:       Optional[str]  = None
    PhoneNumber:  Optional[str]  = None
    Email:        Optional[str]  = None
    DepartmentID: Optional[int]  = None
    PositionID:   Optional[int]  = None
    Status:       Optional[str]  = None


class EmployeeResponse(BaseModel):
    EmployeeID:     int
    FullName:       str
    DateOfBirth:    Optional[date]     = None
    HireDate:       Optional[date]     = None
    Gender:         Optional[str]      = None
    PhoneNumber:    Optional[str]      = None
    Email:          Optional[str]      = None
    DepartmentID:   Optional[int]      = None
    PositionID:     Optional[int]      = None
    Status:         Optional[str]      = None
    DepartmentName: Optional[str]      = None
    PositionName:   Optional[str]      = None
    CreatedAt:      Optional[datetime] = None
    UpdatedAt:      Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    employees:   List[EmployeeResponse]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


class EmployeeSearchParams(BaseModel):
    search_term:    Optional[str]  = None
    department_id:  Optional[int]  = None
    position_id:    Optional[int]  = None
    status:         Optional[str]  = None
    hire_date_from: Optional[date] = None
    hire_date_to:   Optional[date] = None


class SalaryResponse(BaseModel):
    SalaryID:     int
    EmployeeID:   int
    EmployeeName: Optional[str]      = None
    SalaryMonth:  date
    BaseSalary:   float
    Bonus:        float
    Deductions:   float
    NetSalary:    float
    CreatedAt:    Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceResponse(BaseModel):
    AttendanceID:    int
    EmployeeID:      int
    EmployeeName:    Optional[str]      = None
    WorkDays:        int
    AbsentDays:      Optional[int]      = 0
    LeaveDays:       Optional[int]      = 0
    AttendanceMonth: date
    CreatedAt:       Optional[datetime] = None

    class Config:
        from_attributes = True


class PayrollGenerateRequest(BaseModel):
    employee_ids: Optional[List[int]] = None
    salary_month: date
    base_salary:  float = 5000000.0


class PayrollGenerateResponse(BaseModel):
    success:         bool
    message:         str
    records_created: int
    records_failed:  int
    details:         List[dict]


class SyncRequest(BaseModel):
    employee_ids: Optional[List[int]] = None
    sync_type:    str = "full"


class SyncResponse(BaseModel):
    success:      bool
    message:      str
    synced_count: int
    failed_count: int
    details:      List[dict]


class DeleteValidationRequest(BaseModel):
    employee_id: int


class DeleteValidationResponse(BaseModel):
    can_delete:       bool
    employee_id:      int
    employee_name:    str
    warnings:         List[str]
    blocking_reasons: List[str]
    related_records:  dict


class DeleteConfirmRequest(BaseModel):
    employee_id:    int
    force_delete:   bool = False
    cascade_delete: bool = False