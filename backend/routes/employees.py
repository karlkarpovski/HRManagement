from fastapi import APIRouter
from ..db_sqlserver import get_sqlserver_conn
from ..db_mysql import get_mysql_conn

router = APIRouter()

# GET ALL
@router.get("/employees")
def get_employees():
    conn = get_sqlserver_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Employees")
    rows = cursor.fetchall()
    return [dict(zip([c[0] for c in cursor.description], row)) for row in rows]


# GET BY ID
@router.get("/employees/{id}")
def get_employee(id: int):
    conn = get_sqlserver_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Employees WHERE EmployeeID=?", id)
    row = cursor.fetchone()
    return {} if not row else dict(zip([c[0] for c in cursor.description], row))


# POST + SYNC
@router.post("/employees")
def create_employee(emp: dict):
    sql = get_sqlserver_conn()
    mysql = get_mysql_conn()

    try:
        s = sql.cursor()
        m = mysql.cursor()

        s.execute("""
            INSERT INTO Employees (FullName, DateOfBirth, Gender, PhoneNumber, Email, HireDate, DepartmentID, PositionID, Status)
            OUTPUT INSERTED.EmployeeID
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            emp["FullName"], emp["DateOfBirth"], emp["Gender"],
            emp["PhoneNumber"], emp["Email"], emp["HireDate"],
            emp["DepartmentID"], emp["PositionID"], emp["Status"]
        ))

        emp_id = s.fetchone()[0]

        m.execute("""
            INSERT INTO employees_payroll (EmployeeID, FullName, Email)
            VALUES (%s, %s, %s)
        """, (emp_id, emp["FullName"], emp["Email"]))

        sql.commit()
        mysql.commit()

        return {"message": "Created", "EmployeeID": emp_id}

    except Exception as e:
        sql.rollback()
        mysql.rollback()
        return {"error": str(e)}


# PUT
@router.put("/employees/{id}")
def update_employee(id: int, emp: dict):
    sql = get_sqlserver_conn()
    mysql = get_mysql_conn()

    try:
        s = sql.cursor()
        m = mysql.cursor()

        s.execute("""
            UPDATE Employees
            SET FullName=?, Email=?
            WHERE EmployeeID=?
        """, (emp["FullName"], emp["Email"], id))

        m.execute("""
            UPDATE employees_payroll
            SET FullName=%s, Email=%s
            WHERE EmployeeID=%s
        """, (emp["FullName"], emp["Email"], id))

        sql.commit()
        mysql.commit()

        return {"message": "Updated"}

    except Exception as e:
        sql.rollback()
        mysql.rollback()
        return {"error": str(e)}


# DELETE
@router.delete("/employees/{id}")
def delete_employee(id: int):
    sql = get_sqlserver_conn()
    mysql = get_mysql_conn()

    try:
        s = sql.cursor()
        m = mysql.cursor()

        # check dividends
        s.execute("SELECT 1 FROM Dividends WHERE EmployeeID=?", id)
        if s.fetchone():
            return {"error": "Has dividends"}

        # check salary
        m.execute("SELECT 1 FROM salaries WHERE EmployeeID=%s", (id,))
        if m.fetchone():
            return {"error": "Has salary"}

        s.execute("DELETE FROM Employees WHERE EmployeeID=?", id)
        m.execute("DELETE FROM employees_payroll WHERE EmployeeID=%s", (id,))

        sql.commit()
        mysql.commit()

        return {"message": "Deleted"}

    except Exception as e:
        sql.rollback()
        mysql.rollback()
        return {"error": str(e)}