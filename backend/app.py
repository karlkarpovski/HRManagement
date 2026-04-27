from flask import Flask, request, jsonify
from flask_cors import CORS
from login import verify_user  # Import the function directly
from employees import get_all_employees, add_employee, delete_employee, get_employee_by_id
import datetime

from employees import get_all_employees, add_employee, get_all_employees, delete_employee, get_employee_by_id
from db import engine_auth, engine_human, log_to_auth
from db import engine_payroll


app = Flask(__name__)
CORS(app)

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

if __name__ == "__main__":
    app.run(debug=True)