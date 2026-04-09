from fastapi import APIRouter
from ..db_sqlserver import get_sqlserver_conn
from ..db_mysql import get_mysql_conn

router = APIRouter()

@router.get("/departments")
def get_departments():
    conn = get_sqlserver_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Departments")
    return cursor.fetchall()


@router.post("/departments")
def create_department(dep: dict):
    sql = get_sqlserver_conn()
    mysql = get_mysql_conn()

    try:
        s = sql.cursor()
        m = mysql.cursor()

        s.execute("""
            INSERT INTO Departments (DepartmentName)
            OUTPUT INSERTED.DepartmentID
            VALUES (?)
        """, dep["DepartmentName"])

        dep_id = s.fetchone()[0]

        m.execute("""
            INSERT INTO departments_payroll (DepartmentID, DepartmentName)
            VALUES (%s, %s)
        """, (dep_id, dep["DepartmentName"]))

        sql.commit()
        mysql.commit()

        return {"id": dep_id}

    except:
        sql.rollback()
        mysql.rollback()
