from flask import request, jsonify
from sqlalchemy import text
from db import engine_human, engine_payroll, log_to_auth

def get_departments():
    try:
        with engine_human.connect() as conn:
            query = text("SELECT * FROM Departments")
            data = conn.execute(query).mappings().all()
        return jsonify([dict(row) for row in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def add_department():
    data = request.json
    h_conn = engine_human.connect()
    p_conn = engine_payroll.connect()
    trans_h = h_conn.begin()
    trans_p = p_conn.begin()

    try:
        # 1. Thêm vào SQL Server
        res = h_conn.execute(text("""
            INSERT INTO Departments (DepartmentName) 
            OUTPUT INSERTED.DepartmentID 
            VALUES (:name)
        """), {"name": data['DepartmentName']})
        new_id = res.fetchone()[0]

        # 2. Đồng bộ sang MySQL
        p_conn.execute(text("""
            INSERT INTO departments_payroll (DepartmentID, DepartmentName) 
            VALUES (:id, :name)
        """), {"id": new_id, "name": data['DepartmentName']})

        trans_h.commit()
        trans_p.commit()
        return jsonify({"DepartmentID": new_id, "message": "Created and Synced"}), 201
    except Exception as e:
        trans_h.rollback()
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500

def update_department(dept_id):
    data = request.json
    h_conn = engine_human.connect()
    p_conn = engine_payroll.connect()
    trans_h = h_conn.begin()
    trans_p = p_conn.begin()

    try:
        # Cập nhật cả 2 DB
        h_conn.execute(text("UPDATE Departments SET DepartmentName = :n WHERE DepartmentID = :id"),
                      {"n": data['DepartmentName'], "id": dept_id})
        p_conn.execute(text("UPDATE departments_payroll SET DepartmentName = :n WHERE DepartmentID = :id"),
                      {"n": data['DepartmentName'], "id": dept_id})

        trans_h.commit()
        trans_p.commit()
        return jsonify({"message": "Updated and Synced"}), 200
    except Exception as e:
        trans_h.rollback()
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500

def delete_department(dept_id):
    h_conn = engine_human.connect()
    p_conn = engine_payroll.connect()
    trans_h = h_conn.begin()
    trans_p = p_conn.begin()

    try:
        # Xóa từ cả 2 DB
        h_conn.execute(text("DELETE FROM Departments WHERE DepartmentID = :id"), {"id": dept_id})
        p_conn.execute(text("DELETE FROM departments_payroll WHERE DepartmentID = :id"), {"id": dept_id})

        trans_h.commit()
        trans_p.commit()
        return jsonify({"message": "Deleted and Synced"}), 200
    except Exception as e:
        trans_h.rollback()
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500
    
def get_positions():
    with engine_human.connect() as conn:
        data = conn.execute(text("SELECT * FROM Positions")).mappings().all()
    return jsonify([dict(row) for row in data])

def add_position():
    data = request.json
    h_conn, p_conn = engine_human.connect(), engine_payroll.connect()
    trans_h, trans_p = h_conn.begin(), p_conn.begin()

    try:
        res = h_conn.execute(text("INSERT INTO Positions (PositionName) OUTPUT INSERTED.PositionID VALUES (:n)"), 
                            {"n": data['PositionName']})
        new_id = res.fetchone()[0]

        p_conn.execute(text("INSERT INTO positions_payroll (PositionID, PositionName) VALUES (:id, :n)"),
                      {"id": new_id, "n": data['PositionName']})

        trans_h.commit()
        trans_p.commit()
        return jsonify({"PositionID": new_id, "message": "Created and Synced"}), 201
    except Exception as e:
        trans_h.rollback()
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500

def update_position(pos_id):
    data = request.json
    h_conn, p_conn = engine_human.connect(), engine_payroll.connect()
    trans_h, trans_p = h_conn.begin(), p_conn.begin()

    try:
        h_conn.execute(text("UPDATE Positions SET PositionName = :n WHERE PositionID = :id"),
                      {"n": data['PositionName'], "id": pos_id})
        p_conn.execute(text("UPDATE positions_payroll SET PositionName = :n WHERE PositionID = :id"),
                      {"n": data['PositionName'], "id": pos_id})
        
        trans_h.commit()
        trans_p.commit()
        return jsonify({"message": "Updated and Synced"}), 200
    except Exception as e:
        trans_h.rollback()
        trans_p.rollback()
        return jsonify({"error": str(e)}), 500