from fastapi import APIRouter
from ..db_mysql import get_mysql_conn

router = APIRouter()

@router.get("/payroll")
def get_payroll():
    conn = get_mysql_conn()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM salaries")
    return cursor.fetchall()