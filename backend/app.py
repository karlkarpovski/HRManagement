from flask import Flask, request, jsonify
from flask_cors import CORS
from login import verify_user  # Import the function directly
from employees import get_all_employees, add_employee, delete_employee, get_employee_by_id, update_employee
from Department_Position import get_departments, add_department, update_department, delete_department, get_positions, add_position, update_position
from payroll_service import get_all_payroll, get_payroll_history, get_all_attendance, get_attendance_by_employee
from Report import (get_hr_report, get_payroll_report, get_dividend_report, 
                    export_hr_report_excel, export_hr_report_pdf,
                    export_payroll_report_excel, export_payroll_report_pdf,
                    export_dividend_report_excel, export_dividend_report_pdf)
from Alerts import get_system_alerts
from dashboard_api import get_total_employees, get_salary_over_time, get_employees_by_department, get_avg_salary_by_department, get_attendance_over_time



app = Flask(__name__)
CORS(app)

@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
def edit_emp(emp_id):
    return update_employee(emp_id)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Vui lòng nhập đủ tài khoản và mật khẩu"
        }), 400

    user = verify_user(username, password)

    if user:
        return jsonify({
            "status": "success",
            "message": "Đăng nhập thành công",
            "user": {
                "id": user['UserID'],
                "username": user['Username'],
                "fullname": user.get('FullName', user['Username']),
                "role": user['RoleName']
            }
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Sai tài khoản hoặc mật khẩu"
        }), 401

@app.route('/api/employees/<int:emp_id>', methods=['GET'])
def get_emp(emp_id):
    return get_employee_by_id(emp_id)

@app.route('/api/employees', methods=['GET'])
def list_emp():
    return get_all_employees()

@app.route('/api/employees', methods=['POST'])
def add_new_employee():
    return add_employee()

@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
def delete_emp(emp_id):
    return delete_employee(emp_id)

@app.route('/api/departments', methods=['GET'])
def list_dept(): return get_departments()

@app.route('/api/departments', methods=['POST'])
def create_dept(): return add_department()

@app.route('/api/departments/<int:id>', methods=['PUT'])
def edit_dept(id): return update_department(id)

@app.route('/api/departments/<int:id>', methods=['DELETE'])
def remove_dept(id): return delete_department(id)

# Routes cho Positions [cite: 50]
@app.route('/api/positions', methods=['GET'])
def list_pos(): return get_positions()

@app.route('/api/positions', methods=['POST'])
def create_pos(): return add_position()

@app.route('/api/positions/<int:id>', methods=['PUT'])
def edit_pos(id): return update_position(id)

@app.route('/api/payroll', methods=['GET'])
def list_payroll():
    return get_all_payroll()

@app.route('/api/payroll/<int:id>/history', methods=['GET'])
def payroll_history(id):
    return get_payroll_history(id)


@app.route('/api/attendance', methods=['GET'])
def list_attendance():
    return get_all_attendance()

@app.route('/api/attendance/<int:id>', methods=['GET'])
def attendance_emp(id):
    return get_attendance_by_employee(id)

@app.route('/api/reports/hr', methods=['GET'])
def report_hr(): return get_hr_report()

@app.route('/api/reports/payroll', methods=['GET'])
def report_payroll(): return get_payroll_report()

@app.route('/api/reports/dividends', methods=['GET'])
def report_dividends(): return get_dividend_report()

# Export HR Report
@app.route('/api/reports/hr/export/excel', methods=['GET'])
def export_hr_excel(): return export_hr_report_excel()

@app.route('/api/reports/hr/export/pdf', methods=['GET'])
def export_hr_pdf(): return export_hr_report_pdf()

# Export Payroll Report
@app.route('/api/reports/payroll/export/excel', methods=['GET'])
def export_payroll_excel(): return export_payroll_report_excel()

@app.route('/api/reports/payroll/export/pdf', methods=['GET'])
def export_payroll_pdf(): return export_payroll_report_pdf()

# Export Dividend Report
@app.route('/api/reports/dividends/export/excel', methods=['GET'])
def export_dividend_excel(): return export_dividend_report_excel()

@app.route('/api/reports/dividends/export/pdf', methods=['GET'])
def export_dividend_pdf(): return export_dividend_report_pdf()

@app.route('/api/alerts', methods=['GET'])
def alerts(): return get_system_alerts()

# Dashboard APIs
@app.route('/api/dashboard/total-employees', methods=['GET'])
def total_employees(): return get_total_employees()

@app.route('/api/dashboard/salary-over-time', methods=['GET'])
def salary_over_time(): return get_salary_over_time()

@app.route('/api/dashboard/employees-by-department', methods=['GET'])
def employees_by_dept(): return get_employees_by_department()

@app.route('/api/dashboard/avg-salary-by-department', methods=['GET'])
def avg_salary_by_dept(): return get_avg_salary_by_department()

@app.route('/api/dashboard/attendance-over-time', methods=['GET'])
def attendance_over_time(): return get_attendance_over_time()

if __name__ == "__main__":
    app.run(debug=True)
