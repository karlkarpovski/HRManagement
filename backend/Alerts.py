from flask import jsonify
from sqlalchemy import text
from db import engine_human, engine_payroll
from datetime import date

def get_system_alerts():
    alerts = []
    today = date.today()

    try:
        # 1. Kỷ niệm ngày làm việc (Dùng database HUMAN - SQL Server)
        with engine_human.connect() as h_conn:
            employees = h_conn.execute(text("SELECT EmployeeID, FullName, HireDate FROM Employees")).mappings().all()
            for emp in employees:
                if emp['HireDate'] and emp['HireDate'].month == today.month and emp['HireDate'].day == today.day:
                    alerts.append({
                        "type": "Anniversary",
                        "message": f"Kỷ niệm ngày vào làm của {emp['FullName']}",
                        "id": emp['EmployeeID']
                    })

        # 2. Nghỉ phép quá mức (Dùng database Payroll - MySQL)
        # SỬA LỖI: Dùng SUM(AbsentDays) thay vì cột Status
        with engine_payroll.connect() as p_conn:
            p_query = text("""
                SELECT EmployeeID, SUM(AbsentDays) as TotalAbsent 
                FROM attendance 
                GROUP BY EmployeeID 
                HAVING SUM(AbsentDays) > 3
            """)
            leaves = p_conn.execute(p_query).mappings().all()
            for leave in leaves:
                alerts.append({
                    "type": "Excessive Leave",
                    "message": f"Nhân viên ID {leave['EmployeeID']} nghỉ tổng cộng {leave['TotalAbsent']} ngày",
                    "count": int(leave['TotalAbsent'])
                })

        # 3. Lương bất thường (Lọc những người lương Net > 20tr - tùy bạn chỉnh số này)
        with engine_payroll.connect() as p_conn:
            s_query = text("SELECT EmployeeID, NetSalary FROM salaries WHERE NetSalary > 20000000")
            high_salaries = p_conn.execute(s_query).mappings().all()
            for s in high_salaries:
                alerts.append({
                    "type": "Salary Anomaly",
                    "message": f"Lương cao bất thường: {float(s['NetSalary']):,.0f} VNĐ (ID: {s['EmployeeID']})"
                })

        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500