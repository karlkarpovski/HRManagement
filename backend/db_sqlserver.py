# db_sqlserver.py
import pyodbc

def get_sqlserver_conn():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS;"
        "DATABASE=HUMAN;"
        "UID=quang;"
        "PWD=123456;"
        "TrustServerCertificate=yes;"
        "Connection Timeout=5;"
    )
    return conn