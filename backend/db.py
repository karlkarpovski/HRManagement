from sqlalchemy import create_engine, text
import datetime

# --- CONNECTION STRINGS ---
AUTH_URL = "mssql+pyodbc://quang:123456@localhost\\SQLEXPRESS/AUTH_DB?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
HUMAN_URL = "mssql+pyodbc://quang:123456@localhost\\SQLEXPRESS/HUMAN?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
PAYROLL_URL = "mysql+pymysql://quang:123456@localhost:3306/payroll"

# Create Engines
engine_auth = create_engine(AUTH_URL)
engine_human = create_engine(HUMAN_URL)
engine_payroll = create_engine(PAYROLL_URL)

# --- HELPER: AUDIT LOG ---
def log_to_auth(user_id, action, endpoint, status):
    try:
        with engine_auth.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO AuditLogs (UserID, Action, Endpoint, Status, Timestamp)
                    VALUES (:u, :a, :e, :s, :t)
                """),
                {"u": user_id, "a": action, "e": endpoint, "s": status, "t": datetime.datetime.now()}
            )
            conn.commit()
    except Exception as e:
        print("Audit log error (non-critical): {}".format(e))