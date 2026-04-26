from flask import request, jsonify
from sqlalchemy import text
from db import engine_human, engine_payroll, log_to_auth
import datetime
from datetime import date

def get_employee_by_id(emp_id):
    try:
        with engine_human.connect() as conn:
            # Truy vấn tìm nhân viên theo ID
            query = text("SELECT * FROM Employees WHERE EmployeeID = :id")
            result = conn.execute(query, {"id": emp_id}).mappings().first()

            # Nếu tìm thấy nhân viên
            if result:
                return jsonify(dict(result)), 200
            
            # Nếu không tìm thấy
            return jsonify({"message": "Không tìm thấy nhân viên với ID này"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def get_all_employees():
    try:
        with engine_human.connect() as conn:
            query = text("SELECT * FROM Employees")
            data = conn.execute(query).mappings().all()
        return jsonify([dict(row) for row in data]) 
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def add_employee():
    data = request.json

    h_conn = engine_human.connect()
    p_conn = engine_payroll.connect()

    trans_h = h_conn.begin()
    trans_p = p_conn.begin()

    try:
        # 1. Insert HUMAN
        res = h_conn.execute(text("""
            INSERT INTO Employees 
            (FullName, Email, DepartmentID, PositionID, DateOfBirth, HireDate)
            OUTPUT INSERTED.EmployeeID
            VALUES (:full, :e, :d, :p, :dob, :hire)
        """),
        {
            "full": f"{data['first_name']} {data['last_name']}",
            "e": data["email"],
            "d": data["dept_id"],
            "p": data["pos_id"],
            "dob": data["dob"],
            "hire": date.today()
        })

        new_id = res.fetchone()[0]

        # 2. Insert PAYROLL
        p_conn.execute(text("""
            INSERT INTO employees_payroll 
            (EmployeeID, FullName, DepartmentID, PositionID, Status)
            VALUES (:id, :name, :dept, :pos, 'Đang làm việc')
        """),
        {
            "id": new_id,
            "name": f"{data['first_name']} {data['last_name']}",
            "dept": data["dept_id"],
            "pos": data["pos_id"]
        })

        # 3. Commit BOTH
        trans_h.commit()
        trans_p.commit()

        # 4. Log AFTER success (safe)
        try:
            log_to_auth(1, "CREATE", f"/employees/{new_id}", "Success")
        except Exception as log_err:
            print("LOG FAILED:", log_err)

        return jsonify({"id": new_id, "message": "Synced successfully"}), 201

    except Exception as e:
        trans_h.rollback()
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        h_conn.close()
        p_conn.close()


def delete_employee(emp_id):
    with engine_payroll.connect() as p_conn:
        check = p_conn.execute(text("SELECT 1 FROM salaries WHERE EmployeeID = :id"), {"id": emp_id}).fetchone()
        if check:
            return jsonify({"error": "Cannot delete: Employee has salary records"}), 400
    
    # Logic xóa ở cả 2 DB...
    return jsonify({"message": "Deleted"})