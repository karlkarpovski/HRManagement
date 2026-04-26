from sqlalchemy import Column, Integer, String, Date, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from database import HRBase


class Department(HRBase):
    __tablename__ = "Departments"

    DepartmentID   = Column(Integer, primary_key=True, autoincrement=True)
    DepartmentName = Column(String(100), nullable=False)
    CreatedAt      = Column(DateTime, nullable=True)
    UpdatedAt      = Column(DateTime, nullable=True)

    employees = relationship("Employee", back_populates="department")


class Position(HRBase):
    __tablename__ = "Positions"

    PositionID   = Column(Integer, primary_key=True, autoincrement=True)
    PositionName = Column(String(100), nullable=False)
    CreatedAt    = Column(DateTime, nullable=True)
    UpdatedAt    = Column(DateTime, nullable=True)

    employees = relationship("Employee", back_populates="position")


class Employee(HRBase):
    __tablename__ = "Employees"

    EmployeeID   = Column(Integer, primary_key=True, autoincrement=True)
    FullName     = Column(String(100), nullable=False)
    DateOfBirth  = Column(Date, nullable=False)
    Gender       = Column(String(10), nullable=True)
    PhoneNumber  = Column(String(15), nullable=True)
    Email        = Column(String(100), nullable=True)
    HireDate     = Column(Date, nullable=False)
    DepartmentID = Column(Integer, ForeignKey("Departments.DepartmentID"), nullable=True)
    PositionID   = Column(Integer, ForeignKey("Positions.PositionID"), nullable=True)
    Status       = Column(String(50), nullable=True)
    CreatedAt    = Column(DateTime, nullable=True)
    UpdatedAt    = Column(DateTime, nullable=True)

    department = relationship("Department", back_populates="employees")
    position   = relationship("Position", back_populates="employees")
    dividends  = relationship("Dividend", back_populates="employee")


class Dividend(HRBase):
    __tablename__ = "Dividends"

    DividendID     = Column(Integer, primary_key=True, autoincrement=True)
    EmployeeID     = Column(Integer, ForeignKey("Employees.EmployeeID"), nullable=True)
    DividendAmount = Column(DECIMAL, nullable=False)
    DividendDate   = Column(Date, nullable=False)
    CreatedAt      = Column(DateTime, nullable=True)

    employee = relationship("Employee", back_populates="dividends")