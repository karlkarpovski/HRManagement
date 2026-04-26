from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from models.hr_models import Employee, Department, Position, Dividend
from models.payroll_models import (
    EmployeePayroll, DepartmentPayroll,
    PositionPayroll, Salary, Attendance,
)


class SyncService:

    @staticmethod
    def sync_departments(hr_db: Session, payroll_db: Session) -> int:
        synced = 0
        for dept in hr_db.query(Department).all():
            existing = (
                payroll_db.query(DepartmentPayroll)
                .filter(DepartmentPayroll.DepartmentID == dept.DepartmentID)
                .first()
            )
            if existing:
                existing.DepartmentName = dept.DepartmentName
                existing.SyncedAt       = datetime.now()
            else:
                payroll_db.add(DepartmentPayroll(
                    DepartmentID=dept.DepartmentID,
                    DepartmentName=dept.DepartmentName,
                    SyncedAt=datetime.now(),
                ))
            synced += 1
        payroll_db.commit()
        return synced

    @staticmethod
    def sync_positions(hr_db: Session, payroll_db: Session) -> int:
        synced = 0
        for pos in hr_db.query(Position).all():
            existing = (
                payroll_db.query(PositionPayroll)
                .filter(PositionPayroll.PositionID == pos.PositionID)
                .first()
            )
            if existing:
                existing.PositionName = pos.PositionName
                existing.SyncedAt     = datetime.now()
            else:
                payroll_db.add(PositionPayroll(
                    PositionID=pos.PositionID,
                    PositionName=pos.PositionName,
                    SyncedAt=datetime.now(),
                ))
            synced += 1
        payroll_db.commit()
        return synced

    @staticmethod
    def sync_employees(
        hr_db: Session,
        payroll_db: Session,
        employee_ids: Optional[List[int]] = None,
    ) -> dict:
        result = {
            "success":      True,
            "message":      "",
            "synced_count": 0,
            "failed_count": 0,
            "details":      [],
        }

        SyncService.sync_departments(hr_db, payroll_db)
        SyncService.sync_positions(hr_db, payroll_db)

        query = hr_db.query(Employee)
        if employee_ids:
            query = query.filter(Employee.EmployeeID.in_(employee_ids))
        employees = query.all()

        for emp in employees:
            try:
                existing = (
                    payroll_db.query(EmployeePayroll)
                    .filter(EmployeePayroll.EmployeeID == emp.EmployeeID)
                    .first()
                )
                if existing:
                    existing.FullName     = emp.FullName
                    existing.DepartmentID = emp.DepartmentID
                    existing.PositionID   = emp.PositionID
                    existing.Status       = emp.Status
                    existing.SyncedAt     = datetime.now()
                    action = "updated"
                else:
                    payroll_db.add(EmployeePayroll(
                        EmployeeID=emp.EmployeeID,
                        FullName=emp.FullName,
                        DepartmentID=emp.DepartmentID,
                        PositionID=emp.PositionID,
                        Status=emp.Status,
                        SyncedAt=datetime.now(),
                    ))
                    action = "created"

                result["synced_count"] += 1
                result["details"].append({
                    "employee_id":   emp.EmployeeID,
                    "employee_name": emp.FullName,
                    "action":        action,
                    "status":        "success",
                })

            except Exception as exc:
                result["failed_count"] += 1
                result["details"].append({
                    "employee_id":   emp.EmployeeID,
                    "employee_name": emp.FullName,
                    "action":        "failed",
                    "status":        "error",
                    "reason":        str(exc),
                })

        payroll_db.commit()
        result["message"] = (
            f"Sync completed. "
            f"Synced: {result['synced_count']}, "
            f"Failed: {result['failed_count']}"
        )
        return result

    @staticmethod
    def validate_deletion(hr_db: Session, payroll_db: Session, employee_id: int) -> dict:
        result = {
            "can_delete":       True,
            "employee_id":      employee_id,
            "employee_name":    "",
            "warnings":         [],
            "blocking_reasons": [],
            "related_records": {
                "payroll_profile":    False,
                "salary_records":     0,
                "attendance_records": 0,
                "dividends":          0,
            },
        }

        emp = hr_db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
        if not emp:
            result["can_delete"] = False
            result["blocking_reasons"].append("Employee not found in HR system")
            return result

        result["employee_name"] = emp.FullName

        payroll_emp = (
            payroll_db.query(EmployeePayroll)
            .filter(EmployeePayroll.EmployeeID == employee_id)
            .first()
        )
        if payroll_emp:
            result["related_records"]["payroll_profile"] = True
            result["warnings"].append("Nhân viên có hồ sơ lương cần xóa")

            salary_cnt = (
                payroll_db.query(Salary)
                .filter(Salary.EmployeeID == employee_id).count()
            )
            result["related_records"]["salary_records"] = salary_cnt
            if salary_cnt > 0:
                result["warnings"].append(f"Nhân viên có {salary_cnt} bản ghi lương")

            att_cnt = (
                payroll_db.query(Attendance)
                .filter(Attendance.EmployeeID == employee_id).count()
            )
            result["related_records"]["attendance_records"] = att_cnt
            if att_cnt > 0:
                result["warnings"].append(f"Nhân viên có {att_cnt} bản ghi chấm công")

        div_cnt = (
            hr_db.query(Dividend)
            .filter(Dividend.EmployeeID == employee_id).count()
        )
        result["related_records"]["dividends"] = div_cnt
        if div_cnt > 0:
            result["warnings"].append(f"Nhân viên có {div_cnt} bản ghi cổ tức")

        if emp.Status == "Đang làm việc":
            result["warnings"].append(
                "Nhân viên đang làm việc — nên chuyển trạng thái trước khi xóa"
            )

        return result

    @staticmethod
    def delete_employee_cascade(
        hr_db: Session,
        payroll_db: Session,
        employee_id: int,
        cascade: bool = False,
    ) -> dict:
        result = {
            "success": False,
            "message": "",
            "deleted_records": {
                "hr_employee":        False,
                "payroll_profile":    False,
                "salary_records":     0,
                "attendance_records": 0,
                "dividends":          0,
            },
        }
        try:
            emp = hr_db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
            if not emp:
                result["message"] = "Employee not found"
                return result

            if cascade:
                payroll_emp = (
                    payroll_db.query(EmployeePayroll)
                    .filter(EmployeePayroll.EmployeeID == employee_id)
                    .first()
                )
                if payroll_emp:
                    sal_del = payroll_db.query(Salary).filter(Salary.EmployeeID == employee_id).delete()
                    att_del = payroll_db.query(Attendance).filter(Attendance.EmployeeID == employee_id).delete()
                    payroll_db.delete(payroll_emp)
                    payroll_db.commit()
                    result["deleted_records"]["salary_records"]     = sal_del
                    result["deleted_records"]["attendance_records"] = att_del
                    result["deleted_records"]["payroll_profile"]    = True

            div_del = hr_db.query(Dividend).filter(Dividend.EmployeeID == employee_id).delete()
            result["deleted_records"]["dividends"] = div_del

            hr_db.delete(emp)
            hr_db.commit()
            result["deleted_records"]["hr_employee"] = True
            result["success"] = True
            result["message"] = f"Đã xóa nhân viên {employee_id} thành công"

        except Exception as exc:
            hr_db.rollback()
            payroll_db.rollback()
            result["message"] = str(exc)

        return result