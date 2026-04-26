from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

from models.payroll_models import EmployeePayroll, Salary, Attendance
from models.hr_models import Employee
from schemas.schemas import PayrollGenerateRequest


class PayrollService:

    @staticmethod
    def get_employee_payroll_profile(payroll_db: Session, employee_id: int):
        return (
            payroll_db.query(EmployeePayroll)
            .filter(EmployeePayroll.EmployeeID == employee_id)
            .first()
        )

    @staticmethod
    def get_salary_records(
        payroll_db: Session,
        employee_id: Optional[int] = None,
        salary_month: Optional[date] = None,
        page: int = 1,
        page_size: int = 10,
    ):
        query = payroll_db.query(Salary)

        if employee_id:
            query = query.filter(Salary.EmployeeID == employee_id)

        if salary_month:
            query = query.filter(Salary.SalaryMonth == salary_month)

        total  = query.count()
        offset = (page - 1) * page_size
        rows   = query.order_by(Salary.SalaryMonth.desc()).offset(offset).limit(page_size).all()

        return {
            "records": [
                {
                    "SalaryID":     r.SalaryID,
                    "EmployeeID":   r.EmployeeID,
                    "EmployeeName": r.employee.FullName if r.employee else None,
                    "SalaryMonth":  r.SalaryMonth,
                    "BaseSalary":   float(r.BaseSalary)  if r.BaseSalary  else 0,
                    "Bonus":        float(r.Bonus)        if r.Bonus       else 0,
                    "Deductions":   float(r.Deductions)   if r.Deductions  else 0,
                    "NetSalary":    float(r.NetSalary)    if r.NetSalary   else 0,
                    "CreatedAt":    r.CreatedAt,
                }
                for r in rows
            ],
            "total":     total,
            "page":      page,
            "page_size": page_size,
        }

    @staticmethod
    def generate_payroll(
        hr_db: Session,
        payroll_db: Session,
        request: PayrollGenerateRequest,
    ):
        results = {
            "success":         True,
            "message":         "",
            "records_created": 0,
            "records_failed":  0,
            "details":         [],
        }

        if request.employee_ids:
            employees = (
                hr_db.query(Employee)
                .filter(
                    Employee.EmployeeID.in_(request.employee_ids),
                    Employee.Status == "Đang làm việc",
                )
                .all()
            )
        else:
            employees = (
                hr_db.query(Employee)
                .filter(Employee.Status == "Đang làm việc")
                .all()
            )

        base = Decimal(str(request.base_salary))

        for emp in employees:
            try:
                payroll_emp = (
                    payroll_db.query(EmployeePayroll)
                    .filter(EmployeePayroll.EmployeeID == emp.EmployeeID)
                    .first()
                )
                if not payroll_emp:
                    results["records_failed"] += 1
                    results["details"].append({
                        "employee_id":   emp.EmployeeID,
                        "employee_name": emp.FullName,
                        "status":        "failed",
                        "reason":        "Employee not synced to payroll system",
                    })
                    continue

                existing = (
                    payroll_db.query(Salary)
                    .filter(
                        Salary.EmployeeID == emp.EmployeeID,
                        Salary.SalaryMonth == request.salary_month,
                    )
                    .first()
                )
                if existing:
                    results["details"].append({
                        "employee_id":   emp.EmployeeID,
                        "employee_name": emp.FullName,
                        "status":        "skipped",
                        "reason":        "Salary record already exists",
                    })
                    continue

                attendance = (
                    payroll_db.query(Attendance)
                    .filter(
                        Attendance.EmployeeID == emp.EmployeeID,
                        Attendance.AttendanceMonth == request.salary_month,
                    )
                    .first()
                )

                bonus      = Decimal("0")
                deductions = Decimal("0")

                if attendance:
                    daily_rate  = base / Decimal("22")
                    absent_days = Decimal(str(attendance.AbsentDays or 0))
                    deductions  = (daily_rate * absent_days).quantize(Decimal("0.01"))

                net = (base + bonus - deductions).quantize(Decimal("0.01"))

                payroll_db.add(Salary(
                    EmployeeID=emp.EmployeeID,
                    SalaryMonth=request.salary_month,
                    BaseSalary=base,
                    Bonus=bonus,
                    Deductions=deductions,
                    NetSalary=net,
                    CreatedAt=datetime.now(),
                ))
                results["records_created"] += 1
                results["details"].append({
                    "employee_id":   emp.EmployeeID,
                    "employee_name": emp.FullName,
                    "status":        "success",
                    "net_salary":    float(net),
                })

            except Exception as exc:
                results["records_failed"] += 1
                results["details"].append({
                    "employee_id":   emp.EmployeeID,
                    "employee_name": emp.FullName,
                    "status":        "failed",
                    "reason":        str(exc),
                })

        payroll_db.commit()
        results["message"] = (
            f"Processed {len(employees)} employees. "
            f"Created: {results['records_created']}, "
            f"Failed: {results['records_failed']}"
        )
        return results

    @staticmethod
    def get_attendance_records(
        payroll_db: Session,
        employee_id: Optional[int] = None,
        month: Optional[date] = None,
    ):
        query = payroll_db.query(Attendance)

        if employee_id:
            query = query.filter(Attendance.EmployeeID == employee_id)

        if month:
            query = query.filter(Attendance.AttendanceMonth == month)

        return [
            {
                "AttendanceID":    r.AttendanceID,
                "EmployeeID":      r.EmployeeID,
                "EmployeeName":    r.employee.FullName if r.employee else None,
                "WorkDays":        r.WorkDays,
                "AbsentDays":      r.AbsentDays,
                "LeaveDays":       r.LeaveDays,
                "AttendanceMonth": r.AttendanceMonth,
                "CreatedAt":       r.CreatedAt,
            }
            for r in query.all()
        ]