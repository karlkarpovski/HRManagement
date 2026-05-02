from flask import jsonify
from sqlalchemy import text
from db import engine_payroll, engine_human

def get_total_employees():
    """API 1: GET /dashboard/total-employees - return total number of employees"""
    try:
        with engine_payroll.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) as total FROM employees_payroll")).fetchone()
            return jsonify({"total_employees": result[0]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_salary_over_time():
    """API 2: GET /dashboard/salary-over-time - return total NetSalary grouped by SalaryMonth"""
    try:
        with engine_payroll.connect() as conn:
            query = text("""
                SELECT 
                    DATE_FORMAT(SalaryMonth, '%Y-%m') as month,
                    SUM(NetSalary) as total_salary
                FROM salaries
                GROUP BY DATE_FORMAT(SalaryMonth, '%Y-%m')
                ORDER BY SalaryMonth
            """)
            data = conn.execute(query).mappings().all()
            return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_employees_by_department():
    """API 3: GET /dashboard/employees-by-department - return employee count grouped by DepartmentName"""
    try:
        with engine_payroll.connect() as conn:
            query = text("""
                SELECT 
                    d.DepartmentName,
                    COUNT(e.EmployeeID) as employee_count
                FROM departments_payroll d
                LEFT JOIN employees_payroll e ON d.DepartmentID = e.DepartmentID
                GROUP BY d.DepartmentName
                ORDER BY employee_count DESC
            """)
            data = conn.execute(query).mappings().all()
            return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_avg_salary_by_department():
    """API 4: GET /dashboard/avg-salary-by-department - return average NetSalary per department"""
    try:
        with engine_payroll.connect() as conn:
            query = text("""
                SELECT 
                    d.DepartmentName,
                    AVG(s.NetSalary) as avg_salary
                FROM departments_payroll d
                LEFT JOIN employees_payroll e ON d.DepartmentID = e.DepartmentID
                LEFT JOIN salaries s ON e.EmployeeID = s.EmployeeID
                GROUP BY d.DepartmentName
                ORDER BY avg_salary DESC
            """)
            data = conn.execute(query).mappings().all()
            return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_attendance_over_time():
    """API 5: GET /dashboard/attendance-over-time - return average WorkDays per month"""
    try:
        with engine_payroll.connect() as conn:
            query = text("""
                SELECT 
                    DATE_FORMAT(AttendanceMonth, '%Y-%m') as month,
                    AVG(WorkDays) as avg_work_days
                FROM attendance
                GROUP BY DATE_FORMAT(AttendanceMonth, '%Y-%m')
                ORDER BY AttendanceMonth
            """)
            data = conn.execute(query).mappings().all()
            return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500