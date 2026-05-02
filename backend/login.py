from sqlalchemy import create_engine, text
import datetime
from db import engine_auth, engine_human, engine_payroll
import bcrypt

def verify_user(username, password):
    query_user = text("""
        SELECT      Roles.RoleName, Users.Username, Users.PasswordHash, Users.EmployeeID, Users.UserID
        FROM        Roles INNER JOIN
                    User_Role ON Roles.RoleID = User_Role.RoleID INNER JOIN
                    Users ON User_Role.UserID = Users.UserID
        WHERE Username = :username 
    """)

    with engine_auth.connect() as conn:
        user = conn.execute(query_user, {"username": username}).fetchone()

    if not user:
        return None
    
    stored_hash = user.PasswordHash

    if isinstance(stored_hash, str):
        stored_hash = stored_hash.encode('utf-8')

    if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
        return None

    query_emp = text("""
        SELECT FullName
        FROM Employees
        WHERE EmployeeID = :emp_id
    """)

    with engine_human.connect() as conn:
        emp = conn.execute(query_emp, {"emp_id": user.EmployeeID}).fetchone()

    return {
        "UserID": user.UserID,
        "Username": user.Username,
        "RoleName": user.RoleName,
        "FullName": emp.FullName if emp else ""
    }

def log_to_auth(user_id, action, endpoint, status):
    with engine_auth.connect() as conn:
        # Status column in AuditLogs is INT (200 = success)
        status_int = 200 if status == "Success" else (int(status) if isinstance(status, (int, str)) and str(status).isdigit() else 400)
        conn.execute(text("""
            INSERT INTO AuditLogs (UserID, Action, Endpoint, Status, Timestamp)
            VALUES (:u, :a, :e, :s, :t)
        """), {"u": user_id, "a": action, "e": endpoint, "s": status_int, "t": datetime.datetime.now()})
        conn.commit()