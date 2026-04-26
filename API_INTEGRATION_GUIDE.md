# API Integration Guide

## Overview
Tất cả các API backend đã được tích hợp vào frontend React. Dưới đây là hướng dẫn chi tiết để sử dụng chúng.

## 1. Authentication Integration

### Login Flow
```javascript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const MyComponent = () => {
  const { login, isAuthenticated, user } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login('admin', 'admin123');
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome {user.username}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### Logout Flow
```javascript
const { logout } = useContext(AuthContext);

const handleLogout = async () => {
  await logout();
  navigate('/login');
};
```

## 2. Protected Routes

```javascript
import ProtectedRoute from '../components/ProtectedRoute';

// In your App.jsx or routing setup
<Routes>
  <Route path="/login" element={<Login />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

## 3. Using Service Modules

### Employee Service
```javascript
import employeeService from '../services/employeeService';

// Get all employees
const employees = await employeeService.getAllEmployees();

// Get single employee
const employee = await employeeService.getEmployeeById(1);

// Create employee
const newEmployee = await employeeService.createEmployee({
  FullName: 'John Doe',
  DateOfBirth: '1990-05-15',
  Gender: 'Male',
  PhoneNumber: '0123456789',
  Email: 'john@company.com',
  HireDate: '2024-01-01',
  DepartmentID: 1,
  PositionID: 1,
  Status: 'Active'
});

// Update employee
const updated = await employeeService.updateEmployee(1, {
  FullName: 'Jane Doe',
  Email: 'jane@company.com'
});

// Delete employee
await employeeService.deleteEmployee(1);
```

### Department Service
```javascript
import departmentService from '../services/departmentService';

// Get all departments
const departments = await departmentService.getAllDepartments();

// Create department
const newDept = await departmentService.createDepartment({
  DepartmentName: 'IT Department'
});

// Update department
const updated = await departmentService.updateDepartment(1, {
  DepartmentName: 'Information Technology'
});

// Delete department
await departmentService.deleteDepartment(1);
```

### Payroll Service
```javascript
import payrollService from '../services/payrollService';

// Get all payroll
const payroll = await payrollService.getPayroll();

// Get payroll by employee
const empPayroll = await payrollService.getPayrollByEmployee(1);
```

### Attendance Service
```javascript
import attendanceService from '../services/attendanceService';

// Get all attendance
const attendance = await attendanceService.getAttendance();

// Get attendance by employee
const empAttendance = await attendanceService.getAttendanceByEmployee(1);
```

## 4. Using API Helper Functions

```javascript
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiHelper';

// GET request
const data = await apiGet('/employees');

// POST request
const newEmployee = await apiPost('/employees', {
  FullName: 'John Doe',
  Email: 'john@company.com',
  // ... other fields
});

// PUT request
const updated = await apiPut('/employees/1', {
  FullName: 'Jane Doe'
});

// DELETE request
await apiDelete('/employees/1');
```

## 5. Full Component Example

```javascript
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import employeeService from '../services/employeeService';

const EmployeeList = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isAuthenticated]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Employees</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.EmployeeID}>
              <td>{emp.EmployeeID}</td>
              <td>{emp.FullName}</td>
              <td>{emp.Email}</td>
              <td>{emp.DepartmentID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
```

## 6. Error Handling

All services already include error handling. You can catch errors like this:

```javascript
try {
  const data = await employeeService.getAllEmployees();
} catch (error) {
  console.error('Failed to fetch:', error.message);
  // Show error to user
}
```

Automatic 401 Unauthorized handling:
- If token expires, user will be redirected to login
- Use apiHelper for automatic token management

## 7. Test Accounts

Use these credentials to test:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| hr01 | hr01pass | HR Manager |
| pay01 | paypass | Payroll Manager |
| emp01 | emppass | Employee |

## 8. Environment Configuration

If you need to change the API URL, create a `.env` file:

```bash
REACT_APP_API_URL=http://127.0.0.1:8000
```

Or in `.env.production`:

```bash
REACT_APP_API_URL=https://api.yourdomain.com
```

## 9. Features Implemented

✅ JWT-based authentication
✅ Automatic token management
✅ Protected routes
✅ Request/response interceptors
✅ Error handling
✅ Automatic 401 redirect to login
✅ Session persistence
✅ All CRUD operations for entities
✅ Reports and alerts endpoints

## 10. File Structure

```
src/
├── config/
│   └── apiConfig.js          # API configuration
├── contexts/
│   └── AuthContext.jsx       # Authentication context
├── components/
│   └── ProtectedRoute.jsx    # Protected route wrapper
├── services/
│   ├── authService.js        # Authentication API
│   ├── employeeService.js    # Employee API
│   ├── departmentService.js  # Department API
│   ├── payrollService.js     # Payroll API
│   ├── attendanceService.js  # Attendance API
│   └── ...other services
├── utils/
│   └── apiHelper.js          # API helper functions
└── pages/
    └── Login.jsx             # Login page (updated)
```

## 11. Next Steps

1. ✅ Backend APIs are running on http://127.0.0.1:8000
2. ✅ Frontend services are integrated
3. 📝 Update your components to use the services
4. 🧪 Test with test accounts
5. 🚀 Deploy to production

## 12. Troubleshooting

### CORS Errors
- Backend already has CORS enabled
- Make sure backend is running on http://127.0.0.1:8000

### 401 Unauthorized
- Token might be expired
- User will be redirected to login page automatically

### API Not Responding
- Check if backend server is running
- Check network tab in DevTools for requests
- Verify API_URL in config

---

**Last Updated:** April 16, 2026
**Status:** ✅ Complete and Ready to Use
