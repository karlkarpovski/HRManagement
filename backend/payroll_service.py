from flask import jsonify
from sqlalchemy import text
from db import engine_payroll

# --- NHÓM PAYROLL APIS ---

def get_all_payroll():
    """Truy xuất toàn bộ bản ghi lương từ PAYROLL.salaries [cite: 230, 231]"""
    try:
        with engine_payroll.connect() as conn:
            # Query lấy dữ liệu từ bảng salaries trong MySQL
            query = text("SELECT * FROM salaries")
            data = conn.execute(query).mappings().all()
        return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_payroll_history(emp_id):
    """Lấy lịch sử lương của 1 nhân viên cụ thể [cite: 230]"""
    try:
        with engine_payroll.connect() as conn:
            query = text("""
                SELECT * FROM salaries 
                WHERE EmployeeID = :id 
                ORDER BY PayDate DESC
            """)
            data = conn.execute(query, {"id": emp_id}).mappings().all()
            
            if not data:
                return jsonify({"message": "Không tìm thấy lịch sử lương"}), 404
                
        return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- NHÓM ATTENDANCE APIS ---

def get_all_attendance():
    """Truy xuất toàn bộ dữ liệu điểm danh từ payroll.attendance [cite: 233, 234]"""
    try:
        with engine_payroll.connect() as conn:
            query = text("SELECT * FROM attendance")
            data = conn.execute(query).mappings().all()
        return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_attendance_by_employee(emp_id):
    """Truy xuất điểm danh của 1 nhân viên [cite: 233]"""
    try:
        with engine_payroll.connect() as conn:
            query = text("SELECT * FROM attendance WHERE EmployeeID = :id")
            data = conn.execute(query, {"id": emp_id}).mappings().all()
            
            if not data:
                return jsonify({"message": "Không tìm thấy dữ liệu điểm danh"}), 404
                
        return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500