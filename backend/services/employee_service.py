from sqlalchemy.orm import Session
from sqlalchemy import or_, String, cast
from typing import Optional
from datetime import datetime

from models.hr_models import Employee, Department, Position, Dividend
from schemas.schemas import EmployeeCreate, EmployeeUpdate, EmployeeSearchParams


def _to_dict(emp: Employee) -> dict:
    return {
        "EmployeeID":     emp.EmployeeID,
        "FullName":       emp.FullName,
        "DateOfBirth":    emp.DateOfBirth,
        "Gender":         emp.Gender,
        "PhoneNumber":    emp.PhoneNumber,
        "Email":          emp.Email,
        "HireDate":       emp.HireDate,
        "Status":         emp.Status,
        "DepartmentID":   emp.DepartmentID,
        "PositionID":     emp.PositionID,
        "DepartmentName": emp.department.DepartmentName if emp.department else None,
        "PositionName":   emp.position.PositionName     if emp.position   else None,
        "CreatedAt":      emp.CreatedAt,
        "UpdatedAt":      emp.UpdatedAt,
    }


class EmployeeService:

    @staticmethod
    def get_all_employees(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "EmployeeID",
        sort_order: str = "asc",
    ):
        query = db.query(Employee)
        total = query.count()
        col   = getattr(Employee, sort_by, Employee.EmployeeID)
        query = query.order_by(col.desc() if sort_order == "desc" else col.asc())
        offset = (page - 1) * page_size
        rows   = query.offset(offset).limit(page_size).all()
        return {
            "employees":   [_to_dict(e) for e in rows],
            "total":       total,
            "page":        page,
            "page_size":   page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
        }

    @staticmethod
    def search_employees(
        db: Session,
        params: EmployeeSearchParams,
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Employee)

        if params.search_term:
            s = f"%{params.search_term}%"
            query = query.filter(
                or_(
                    Employee.FullName.ilike(s),
                    Employee.Email.ilike(s),
                    Employee.PhoneNumber.ilike(s),
                    cast(Employee.EmployeeID, String).ilike(s),
                )
            )

        if params.department_id:
            query = query.filter(Employee.DepartmentID == params.department_id)

        if params.position_id:
            query = query.filter(Employee.PositionID == params.position_id)

        if params.status:
            query = query.filter(Employee.Status == params.status)

        if params.hire_date_from:
            query = query.filter(Employee.HireDate >= params.hire_date_from)

        if params.hire_date_to:
            query = query.filter(Employee.HireDate <= params.hire_date_to)

        total  = query.count()
        offset = (page - 1) * page_size
        rows   = query.order_by(Employee.EmployeeID).offset(offset).limit(page_size).all()

        return {
            "employees":   [_to_dict(e) for e in rows],
            "total":       total,
            "page":        page,
            "page_size":   page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
        }

    @staticmethod
    def get_employee_by_id(db: Session, employee_id: int):
        emp = db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
        return _to_dict(emp) if emp else None

    @staticmethod
    def create_employee(db: Session, data: EmployeeCreate):
        now = datetime.now()
        emp = Employee(
            FullName=data.FullName,
            DateOfBirth=data.DateOfBirth,
            Gender=data.Gender,
            PhoneNumber=data.PhoneNumber,
            Email=data.Email,
            HireDate=data.HireDate,
            Status=data.Status or "Đang làm việc",
            DepartmentID=data.DepartmentID,
            PositionID=data.PositionID,
            CreatedAt=now,
            UpdatedAt=now,
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)
        return _to_dict(emp)

    @staticmethod
    def update_employee(db: Session, employee_id: int, data: EmployeeUpdate):
        emp = db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
        if not emp:
            return None
        for field, value in data.dict(exclude_unset=True).items():
            if value is not None:
                setattr(emp, field, value)
        emp.UpdatedAt = datetime.now()
        db.commit()
        db.refresh(emp)
        return _to_dict(emp)

    @staticmethod
    def delete_employee(db: Session, employee_id: int):
        emp = db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
        if not emp:
            return {"success": False, "message": "Employee not found"}
        try:
            db.query(Dividend).filter(Dividend.EmployeeID == employee_id).delete()
            db.delete(emp)
            db.commit()
            return {"success": True, "message": f"Employee {employee_id} deleted"}
        except Exception as exc:
            db.rollback()
            return {"success": False, "message": str(exc)}

    @staticmethod
    def get_all_departments(db: Session):
        return [
            {"DepartmentID": d.DepartmentID, "DepartmentName": d.DepartmentName}
            for d in db.query(Department).order_by(Department.DepartmentName).all()
        ]

    @staticmethod
    def get_all_positions(db: Session):
        return [
            {"PositionID": p.PositionID, "PositionName": p.PositionName}
            for p in db.query(Position).order_by(Position.PositionName).all()
        ]