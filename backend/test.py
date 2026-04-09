"""Utility script to verify database connectivity.

This module is not meant to be imported by the FastAPI app; it should only be
run as a standalone script when a developer wants to quickly test the
SQL Server and MySQL connection settings.
"""

from .db_sqlserver import get_sqlserver_conn
from .db_mysql import get_mysql_conn


def main():
    # Test SQL Server
    try:
        print("--- Testing SQL Server ---")
        conn_sql = get_sqlserver_conn()
        print("SQL Server: OK!")
        conn_sql.close()
    except Exception as e:
        print(f"SQL Server Error: {e}")

    # Test MySQL
    try:
        print("\n--- Testing MySQL ---")
        conn_mysql = get_mysql_conn()
        print("MySQL: OK!")
        conn_mysql.close()
    except Exception as e:
        print(f"MySQL Error: {e}")


if __name__ == "__main__":
    main()
