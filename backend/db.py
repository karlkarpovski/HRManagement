from sqlalchemy import create_engine, text
import datetime
from sqlalchemy.orm import sessionmaker


# --- CONNECTION STRINGS (Đã test OK) ---
AUTH_URL = "mssql+pyodbc://quang:123456@localhost\\SQLEXPRESS/AUTH_DB?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
HUMAN_URL = "mssql+pyodbc://quang:123456@localhost\\SQLEXPRESS/HUMAN?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
PAYROLL_URL = "mysql+pymysql://quang:123456@localhost:3306/payroll"

# Tạo Engines
engine_auth = create_engine(AUTH_URL)
engine_human = create_engine(HUMAN_URL)
engine_payroll = create_engine(PAYROLL_URL)

# --- HELPER: GHI AUDIT LOG (CASE STUDY 4) ---
def log_to_auth(user_id, action, endpoint, status):
    with engine_auth.connect() as conn:
        conn.execute(text("""
            INSERT INTO AuditLogs (UserID, Action, Endpoint, Status, Timestamp)
            VALUES (:u, :a, :e, :s, :t)"""),
            {"u": user_id, "a": action, "e": endpoint, "s": status, "t": datetime.datetime.now()}
        )
        conn.commit()