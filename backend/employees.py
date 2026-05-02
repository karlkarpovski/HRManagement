from flask import request, jsonify
from sqlalchemy import text
from db import engine_human, engine_payroll, log_to_auth
import datetime
from datetime import date

def get_employee_by_id(emp_id):
    try:
        with engine_human.connect() as conn:
            query = text("""
                SELECT e.*, d.DepartmentName, p.PositionName
                FROM Employees e
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                LEFT JOIN Positions p ON e.PositionID = p.PositionID
                WHERE e.EmployeeID = :id
            """)
            result = conn.execute(query, {"id": emp_id}).mappings().first()

            if result:
                return jsonify(dict(result)), 200
            
            return jsonify({"message": "Không tìm thấy nhân viên với ID này"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def get_all_employees():
    try:
        with engine_human.connect() as conn:
            query = text("""
                SELECT e.*, d.DepartmentName, p.PositionName
                FROM Employees e
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                LEFT JOIN Positions p ON e.PositionID = p.PositionID
            """)
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
        # Support both old format (first_name/last_name) and new format (FullName)
        if 'FullName' in data:
            full_name = data['FullName']
            email = data.get('Email', '')
            dept_id = data.get('DepartmentID')
            pos_id = data.get('PositionID')
            dob_val = data.get('DateOfBirth')
        else:
            full_name = f"{data['first_name']} {data['last_name']}"
            email = data["email"]
            dept_id = data["dept_id"]
            pos_id = data["pos_id"]
            dob_val = data["dob"]

        res = h_conn.execute(text("""
            INSERT INTO Employees 
            (FullName, Email, DepartmentID, PositionID, DateOfBirth, HireDate)
            OUTPUT INSERTED.EmployeeID
            VALUES (:full, :e, :d, :p, :dob, :hire)
        """),
        {
            "full": full_name,
            "e": email,
            "d": dept_id,
            "p": pos_id,
            "dob": dob_val if dob_val else None,
            "hire": date.today()
        })

        new_id = res.fetchone()[0]

        p_conn.execute(text("""
            INSERT INTO employees_payroll 
            (EmployeeID, FullName, DepartmentID, PositionID, Status)
            VALUES (:id, :name, :dept, :pos, 'Đang làm việc')
        """),
        {
            "id": new_id,
            "name": full_name,
            "dept": dept_id,
            "pos": pos_id
        })

        trans_h.commit()
        trans_p.commit()

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
    
    return jsonify({"message": "Deleted"})

def update_employee(emp_id):
    data = request.json
    full_name = data.get('FullName')
    dept_id = data.get('DepartmentID')
    pos_id = data.get('PositionID')

    h_conn = engine_human.connect()
    p_conn = engine_payroll.connect()

    trans_h = h_conn.begin()
    trans_p = p_conn.begin()

    try:
        check_dept = h_conn.execute(text("SELECT 1 FROM Departments WHERE DepartmentID = :d"), {"d": dept_id}).fetchone()
        check_pos = h_conn.execute(text("SELECT 1 FROM Positions WHERE PositionID = :p"), {"p": pos_id}).fetchone()

        if not check_dept or not check_pos:
            return jsonify({"error": "DepartmentID or PositionID does not exist in HR system"}), 400

        h_conn.execute(text("""
            UPDATE Employees 
            SET FullName = :name, DepartmentID = :d_id, PositionID = :p_id 
            WHERE EmployeeID = :e_id
        """), {'name': full_name, 'd_id': dept_id, 'p_id': pos_id, 'e_id': emp_id})

        p_conn.execute(text("""
            UPDATE employees_payroll 
            SET FullName = :name, DepartmentID = :d_id, PositionID = :p_id 
            WHERE EmployeeID = :e_id
        """), {'name': full_name, 'd_id': dept_id, 'p_id': pos_id, 'e_id': emp_id})

        trans_h.commit()
        trans_p.commit()

        log_to_auth(1, "UPDATE", f"/employees/{emp_id}", "Success")

        return jsonify({"message": "Update and Sync successful"}), 200

    except Exception as e:
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500
    
    finally:
        h_conn.close()
        p_conn.close()