from flask import jsonify
from sqlalchemy import text
from db import engine_human, engine_payroll
from datetime import date

# GET /reports/hr: Thống kê nhân sự từ HUMAN_2025 [cite: 61]
def get_hr_report():
    try:
        with engine_human.connect() as conn:
            # Thống kê số lượng nhân viên theo phòng ban
            query = text("""
                SELECT d.DepartmentName, COUNT(e.EmployeeID) as TotalEmployees
                FROM Departments d
                LEFT JOIN Employees e ON d.DepartmentID = e.DepartmentID
                GROUP BY d.DepartmentName
            """)
            result = conn.execute(query).mappings().all()
        return jsonify([dict(row) for row in result]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET /reports/payroll: Tổng hợp lương (Join HR + Payroll) [cite: 61, 62]
def get_payroll_report():
    try:
        # Lấy dữ liệu lương từ MySQL
        with engine_payroll.connect() as p_conn:
            p_query = text("SELECT EmployeeID, SUM(NetSalary) as TotalPaid FROM salaries GROUP BY EmployeeID")
            p_data = {row['EmployeeID']: float(row['TotalPaid']) for row in p_conn.execute(p_query).mappings().all()}

        # Lấy thông tin nhân viên từ SQL Server (kèm DepartmentName)
        with engine_human.connect() as h_conn:
            h_query = text("""
                SELECT e.EmployeeID, e.FullName, d.DepartmentName
                FROM Employees e
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            """)
            h_data = h_conn.execute(h_query).mappings().all()

        report = []
        for emp in h_data:
            report.append({
                "EmployeeID": emp['EmployeeID'],
                "FullName": emp['FullName'],
                "DepartmentName": emp['DepartmentName'] or 'N/A',
                "TotalEarnings": p_data.get(emp['EmployeeID'], 0)
            })
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET /reports/dividends: Lịch sử cổ tức từ HUMAN_2025 [cite: 61]
def get_dividend_report():
    try:
        with engine_human.connect() as conn:
            query = text("SELECT * FROM Dividends ORDER BY DividendDate DESC")
            result = conn.execute(query).mappings().all()
        return jsonify([dict(row) for row in result]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500