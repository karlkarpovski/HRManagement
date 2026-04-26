from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_hr_db
from services.employee_service import EmployeeService
from schemas.schemas import EmployeeCreate, EmployeeUpdate, EmployeeSearchParams

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.get("")
def get_employees(
    page:       int = Query(1, ge=1),
    page_size:  int = Query(10, le=100, ge=1),
    sort_by:    str = Query("EmployeeID"),
    sort_order: str = Query("asc"),
    db: Session = Depends(get_hr_db),
):
    return EmployeeService.get_all_employees(db, page, page_size, sort_by, sort_order)


@router.post("/search")
def search_employees(
    params:    EmployeeSearchParams,
    page:      int = Query(1, ge=1),
    page_size: int = Query(10, le=100, ge=1),
    db: Session = Depends(get_hr_db),
):
    return EmployeeService.search_employees(db, params, page, page_size)


@router.get("/departments")
def get_departments(db: Session = Depends(get_hr_db)):
    return EmployeeService.get_all_departments(db)


@router.get("/positions")
def get_positions(db: Session = Depends(get_hr_db)):
    return EmployeeService.get_all_positions(db)


@router.get("/{employee_id}")
def get_employee(employee_id: int, db: Session = Depends(get_hr_db)):
    emp = EmployeeService.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.post("")
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_hr_db)):
    return EmployeeService.create_employee(db, employee)


@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    employee:    EmployeeUpdate,
    db: Session = Depends(get_hr_db),
):
    result = EmployeeService.update_employee(db, employee_id, employee)
    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")
    return result


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_hr_db)):
    result = EmployeeService.delete_employee(db, employee_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result