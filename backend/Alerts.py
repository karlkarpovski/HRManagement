from flask import jsonify
from sqlalchemy import text
from db import engine_human, engine_payroll
from datetime import date

def get_system_alerts():
    today = date.today()
    alerts = []
    # Khởi tạo map để tránh lỗi "name 'employee_map' is not defined"
    employee_map = {} 

    try:
        # BƯỚC 1: Kết nối HUMAN_DB (SQL Server) để lấy danh sách nhân viên gốc
        # Đây là nguồn định danh (Master Data)[cite: 1]
        with engine_human.connect() as h_conn:
            h_query = text("SELECT EmployeeID, FullName, HireDate FROM Employees")
            employees = h_conn.execute(h_query).mappings().all()
            
            for emp in employees:
                eid = emp['EmployeeID']
                name = emp['FullName']
                employee_map[eid] = name # Ánh xạ ID -> Tên[cite: 1]
                
                # Cảnh báo Kỷ niệm ngày vào làm (Dựa trên HireDate)[cite: 1]
                if emp['HireDate'] and emp['HireDate'].month == today.month and emp['HireDate'].day == today.day:
                    alerts.append({
                        "type": "Anniversary",
                        "message": f"Kỷ niệm ngày vào làm của {name}",
                        "id": eid
                    })

        # BƯỚC 2: Kết nối PAYROLL_DB (MySQL) - Xử lý tập trung các chỉ số chuyên cần và lương
        # Gộp các truy vấn vào một kết nối để tiết kiệm tài nguyên[cite: 2]
        with engine_payroll.connect() as p_conn:
            
            # 2a. Kiểm tra nghỉ phép quá nhiều (> 3 ngày)[cite: 2]
            p_query = text("""
                SELECT EmployeeID, SUM(AbsentDays) as TotalAbsent 
                FROM attendance 
                GROUP BY EmployeeID 
                HAVING SUM(AbsentDays) > 3
            """)
            leaves = p_conn.execute(p_query).mappings().all()
            
            for leave in leaves:
                eid = leave['EmployeeID']
                full_name = employee_map.get(eid, f"Nhân viên ID {eid}")
                alerts.append({
                    "type": "Excessive Leave",
                    "message": f"Nhân viên {full_name} nghỉ tổng cộng {int(leave['TotalAbsent'])} ngày",
                    "count": int(leave['TotalAbsent'])
                })

            # 2b. Kiểm tra lương bất thường (> 20,000,000 VNĐ)[cite: 2]
            s_query = text("SELECT EmployeeID, NetSalary FROM salaries WHERE NetSalary > 20000000")
            high_salaries = p_conn.execute(s_query).mappings().all()
            
            for s in high_salaries:
                eid = s['EmployeeID']
                full_name = employee_map.get(eid, f"Nhân viên ID {eid}")
                salary_val = float(s['NetSalary'])
                alerts.append({
                    "type": "Salary Anomaly",
                    "message": f"Lương cao bất thường: {full_name} ({salary_val:,.0f} VNĐ)"
                })

        return jsonify(alerts), 200

    except Exception as e:
        # Log lỗi chi tiết để quản trị viên kiểm tra quyền truy cập hoặc kết nối[cite: 3]
        print(f"CRITICAL ERROR - Alerts API: {str(e)}") 
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500