from fastapi import APIRouter
from ..db_sqlserver import get_sqlserver_conn
from ..db_mysql import get_mysql_conn

router = APIRouter()

@router.get("/reports/hr")
def report_hr():
    conn = get_sqlserver_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Employees")
    rows = cursor.fetchall()
    # Convert pyodbc.Row objects into JSON-serializable dicts
    columns = [c[0] for c in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


@router.get("/reports/payroll")
def report_payroll():
    sql = get_sqlserver_conn()
    mysql = get_mysql_conn()

    s = sql.cursor()
    m = mysql.cursor(dictionary=True)

    s.execute("SELECT EmployeeID, FullName FROM Employees")
    emp = s.fetchall()

    # salaries table stores computed NetSalary; roll up per employee.
    m.execute("SELECT EmployeeID, SUM(NetSalary) AS Total FROM salaries GROUP BY EmployeeID")
    sal = m.fetchall()

    sal_map = {x["EmployeeID"]: x["Total"] for x in sal}

    result = []
    for e in emp:
        result.append({
            "EmployeeID": e[0],
            "FullName": e[1],
            "TotalSalary": sal_map.get(e[0], 0)
        })

    return result