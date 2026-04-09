# db_mysql.py
import mysql.connector

def get_mysql_conn():
    conn = mysql.connector.connect(
        host="localhost",
        user="quang",
        password="123456",
        database="payroll",
        connection_timeout=5,
    )
    return conn