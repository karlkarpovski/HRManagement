from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import SQL_SERVER_CONN_PYMSSQL, MYSQL_CONN

hr_engine = create_engine(
    SQL_SERVER_CONN_PYMSSQL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
)
HRSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=hr_engine)
HRBase = declarative_base()

payroll_engine = create_engine(
    MYSQL_CONN,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
)
PayrollSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=payroll_engine)
PayrollBase = declarative_base()


def get_hr_db():
    db = HRSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_payroll_db():
    db = PayrollSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_both_dbs():
    hr_db = HRSessionLocal()
    payroll_db = PayrollSessionLocal()
    try:
        yield hr_db, payroll_db
    finally:
        hr_db.close()
        payroll_db.close()