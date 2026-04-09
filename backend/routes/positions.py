from fastapi import APIRouter
from ..db_sqlserver import get_sqlserver_conn
from ..db_mysql import get_mysql_conn

router = APIRouter()

@router.get("/positions")
def get_positions():
    conn = get_sqlserver_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Positions")
    return cursor.fetchall()


@router.post("/positions")
def create_position(pos: dict):
    sql = get_sqlserver_conn()
    mysql = get_mysql_conn()

    try:
        s = sql.cursor()
        m = mysql.cursor()

        s.execute("""
            INSERT INTO Positions (PositionName)
            OUTPUT INSERTED.PositionID
            VALUES (?)
        """, pos["PositionName"])

        pos_id = s.fetchone()[0]

        m.execute("""
            INSERT INTO positions_payroll (PositionID, PositionName)
            VALUES (%s, %s)
        """, (pos_id, pos["PositionName"]))

        sql.commit()
        mysql.commit()

        return {"id": pos_id}

    except:
        sql.rollback()
        mysql.rollback()