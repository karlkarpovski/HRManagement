from fastapi import APIRouter
from ..db_sqlserver import get_sqlserver_conn

router = APIRouter()

@router.get("/alerts")
def alerts():
    conn = get_sqlserver_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT FullName FROM Employees")
    data = cursor.fetchall()

    return [{"message": f"{x[0]} anniversary"} for x in data]