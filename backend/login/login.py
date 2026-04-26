from sqlalchemy import create_engine, text
import datetime
from db import engine_auth, engine_human, log_to_auth
import bcrypt

import bcrypt
from sqlalchemy import text
from db import engine_auth

def verify_user(username, password):
    query_user = text("""
        SELECT UserID, Username, PasswordHash, EmployeeID
        FROM Users
        WHERE Username = :username
    """)

    with engine_auth.connect() as conn:
        user = conn.execute(query_user, {
            "username": username
        }).fetchone()

    if not user:
        return None

    # check password
    if not bcrypt.checkpw(password.encode('utf-8'), user.PasswordHash.encode('utf-8')):
        return None

    # 🔥 query DB HUMAN
    query_emp = text("""
        SELECT FullName
        FROM Employees
        WHERE EmployeeID = :emp_id
    """)

    with engine_human.connect() as conn:
        emp = conn.execute(query_emp, {
            "emp_id": user.EmployeeID
        }).fetchone()

    return {
        "UserID": user.UserID,
        "Username": user.Username,
        "FullName": emp.FullName if emp else ""
    }

def log_to_auth(user_id, action, endpoint, status):
    with engine_auth.connect() as conn:
        conn.execute(text("""
            INSERT INTO AuditLogs (UserID, Action, Endpoint, Status, Timestamp)
            VALUES (:u, :a, :e, :s, :t)"""),
            {"u": user_id, "a": action, "e": endpoint, "s": status, "t": datetime.datetime.now()}
        )
        conn.commit()