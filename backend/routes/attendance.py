from fastapi import APIRouter
from ..db_mysql import get_mysql_conn

router = APIRouter()

@router.get("/attendance")
def get_attendance():
    conn = get_mysql_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM attendance")
    return cursor.fetchall()


@router.get("/attendance/{id}")
def get_attendance_by_id(id: int):
    conn = get_mysql_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM attendance WHERE EmployeeID=%s", (id,))
    return cursor.fetchall()