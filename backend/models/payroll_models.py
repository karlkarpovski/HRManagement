from sqlalchemy import Column, Integer, String, Date, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from database import PayrollBase


class DepartmentPayroll(PayrollBase):
    __tablename__ = "departments_payroll"

    DepartmentID   = Column(Integer, primary_key=True)
    DepartmentName = Column(String(100), nullable=False)
    SyncedAt       = Column(DateTime, nullable=True)

    employees = relationship("EmployeePayroll", back_populates="department")


class PositionPayroll(PayrollBase):
    __tablename__ = "positions_payroll"

    PositionID   = Column(Integer, primary_key=True)
    PositionName = Column(String(100), nullable=False)
    SyncedAt     = Column(DateTime, nullable=True)

    employees = relationship("EmployeePayroll", back_populates="position")


class EmployeePayroll(PayrollBase):
    __tablename__ = "employees_payroll"

    EmployeeID   = Column(Integer, primary_key=True)
    FullName     = Column(String(100), nullable=False)
    DepartmentID = Column(Integer, ForeignKey("departments_payroll.DepartmentID"), nullable=True)
    PositionID   = Column(Integer, ForeignKey("positions_payroll.PositionID"), nullable=True)
    Status       = Column(String(50), nullable=True)
    SyncedAt     = Column(DateTime, nullable=True)

    department         = relationship("DepartmentPayroll", back_populates="employees")
    position           = relationship("PositionPayroll", back_populates="employees")
    salaries           = relationship("Salary", back_populates="employee")
    attendance_records = relationship("Attendance", back_populates="employee")


class Salary(PayrollBase):
    __tablename__ = "salaries"

    SalaryID    = Column(Integer, primary_key=True, autoincrement=True)
    EmployeeID  = Column(Integer, ForeignKey("employees_payroll.EmployeeID"), nullable=True)
    SalaryMonth = Column(Date, nullable=False)
    BaseSalary  = Column(DECIMAL, nullable=False)
    Bonus       = Column(DECIMAL, nullable=True)
    Deductions  = Column(DECIMAL, nullable=True)
    NetSalary   = Column(DECIMAL, nullable=False)
    CreatedAt   = Column(DateTime, nullable=True)

    employee = relationship("EmployeePayroll", back_populates="salaries")


class Attendance(PayrollBase):
    __tablename__ = "attendance"

    AttendanceID    = Column(Integer, primary_key=True, autoincrement=True)
    EmployeeID      = Column(Integer, ForeignKey("employees_payroll.EmployeeID"), nullable=True)
    WorkDays        = Column(Integer, nullable=False)
    AbsentDays      = Column(Integer, nullable=True)
    LeaveDays       = Column(Integer, nullable=True)
    AttendanceMonth = Column(Date, nullable=False)
    CreatedAt       = Column(DateTime, nullable=True)

    employee = relationship("EmployeePayroll", back_populates="attendance_records")