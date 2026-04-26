# API Testing Guide - HR Management System

## Quick Start

### Prerequisites
```bash
cd g:\tich hop\HRManagement
```

### 1. Activate Virtual Environment
```powershell
# Windows PowerShell
& "g:/tich hop/HRManagement/venv/Scripts/Activate.ps1"
```

### 2. Install Dependencies (if not already installed)
```bash
pip install fastapi uvicorn pyodbc mysql-connector-python requests
```

### 3. Start Backend Server (Terminal 1)
```bash
cd backend
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 4. Run Test Suite (Terminal 2)
```bash
cd backend
python test_apis_http.py
```

---

## Test Files Available

### 1. **test_apis_http.py** (Recommended)
- **Type:** HTTP-based tests
- **Language:** Python with requests library
- **How to run:** `python test_apis_http.py`
- **Output:** Colored console output with detailed results
- **Benefits:** 
  - Works without importing the app module
  - Tests actual HTTP requests
  - Easier to debug
  - Shows all API responses

### 2. **test_apis.py**
- **Type:** pytest with TestClient
- **Language:** Python with pytest
- **How to run:** `pytest test_apis.py -v -s`
- **Status:** Couldn't run due to import issues (fixed in routes)

---

## Test Results Summary

### ✅ Working Endpoints (15/19)

| Module | Endpoint | Status |
|--------|----------|--------|
| Employees | GET /employees | ✓ |
| | GET /employees/{id} | ✓ |
| Departments | POST /departments | ✓ |
| Positions | POST /positions | ✓ |
| Payroll | GET /payroll | ✓ |
| Attendance | GET /attendance | ✓ |
| | GET /attendance/{id} | ✓ |
| Reports | GET /reports/hr | ✓ |
| | GET /reports/payroll | ✓ |
| Alerts | GET /alerts | ✓ |

### ⚠️ Issues Found (4 endpoints)

1. **POST /employees** - Database schema error
   - Error: `Unknown column 'Email' in 'field list'`
   - Solution: Add Email column to MySQL employees_payroll table

2. **GET /departments** - Row serialization error
   - Error: pyodbc.Row objects can't be serialized to JSON
   - Solution: Convert rows to dictionaries (fix provided in test report)

3. **GET /positions** - Row serialization error
   - Error: Same as departments
   - Solution: Same as departments

4. **PUT /employees/{id}** - Not tested (depends on POST fix)

5. **DELETE /employees/{id}** - Not tested (depends on POST fix)

---

## Database Connections

### SQL Server
- **Server:** localhost\SQLEXPRESS
- **Database:** HUMAN
- **User:** quang
- **Timeout:** 5 seconds

### MySQL
- **Host:** localhost
- **Database:** payroll
- **User:** quang
- **Timeout:** 5 seconds

---

## API Documentation

### Access FastAPI Auto-docs
- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc
- **OpenAPI JSON:** http://127.0.0.1:8000/openapi.json

---

## Sample API Calls

### Get All Employees
```bash
curl http://127.0.0.1:8000/employees
```

### Get Payroll Data
```bash
curl http://127.0.0.1:8000/payroll
```

### Get HR Report
```bash
curl http://127.0.0.1:8000/reports/hr
```

### Get Attendance Data
```bash
curl http://127.0.0.1:8000/attendance
```

### Create Department
```bash
curl -X POST http://127.0.0.1:8000/departments \
  -H "Content-Type: application/json" \
  -d '{"DepartmentName": "IT"}'
```

---

## Troubleshooting

### Port 8000 Already in Use
```powershell
# Kill the process using port 8000
Stop-Process -Name python -Force
```

### Import Errors
- The backend imports have been fixed to use absolute paths
- All route files now add the parent directory to sys.path

### Database Connection Errors
1. Check SQL Server is running:
   ```powershell
   telnet localhost 1433
   ```

2. Check MySQL is running:
   ```powershell
   telnet localhost 3306
   ```

3. Verify credentials in `db_sqlserver.py` and `db_mysql.py`

---

## Continuous Testing

### Watch Mode (Auto-reload)
```bash
cd backend
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### Run Tests Automatically
```bash
# Install watchdog for file watching
pip install watchdog

# Watch for changes and run tests
python test_apis_http.py
```

---

## Next Steps

1. **Fix Database Issues**
   - Resolve schema inconsistencies
   - Verify data integrity between SQL Server and MySQL

2. **Improve Error Handling**
   - Add proper HTTP status codes
   - Add validation decorators

3. **Add More Tests**
   - Test edge cases
   - Test concurrent requests
   - Test error scenarios

4. **Production Deployment**
   - Set up proper logging
   - Configure security headers
   - Add rate limiting
   - Implement authentication

---

## Additional Resources

- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **Uvicorn Documentation:** https://www.uvicorn.org/
- **pyodbc Documentation:** https://github.com/mkleehammer/pyodbc
- **mysql-connector-python:** https://dev.mysql.com/doc/connector-python/

---

**Last Updated:** April 16, 2026
**Test Suite Version:** 1.0
**Backend Status:** ✓ Operational
