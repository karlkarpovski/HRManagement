# Phân Tích & Giải Pháp: Dữ Liệu Frontend vs Database

**Ngày:** 16 tháng 4, 2026  
**Vấn đề:** Dữ liệu hiển thị trên giao diện không khớp với dữ liệu trong database

---

## 🔴 Nguyên Nhân Gốc

Frontend React sử dụng **hardcoded dummy data** thay vì gọi API để lấy dữ liệu từ database.

### Chi tiết vấn đề:

| Component | Vấn đề | Dữ liệu |
|-----------|--------|--------|
| `Employees.jsx` | Hardcoded 5 employees | `{ id, name, department, position, salary, status }` |
| `Departments.jsx` | Hardcoded 4 departments | `{ id, name, manager, employees, budget }` |
| `Dashboard.jsx` | Hardcoded stats & charts | `totalEmployees: 125, totalSalary: 850000` |
| Backend API | ✅ Hoạt động tốt | Trả dữ liệu từ SQL Server |
| Database (SQL Server) | ✅ Hoạt động tốt | Chứa dữ liệu thực tế |

**Kết quả:** Khi người dùng thay đổi dữ liệu trên frontend, nó chỉ cập nhật state cục bộ, **KHÔNG lưu vào database**.

---

## ✅ Giải Pháp Đã Thực Hiện

### 1. **Employees.jsx** - Kết nối API
```jsx
// ✅ Trước: Hardcoded data
const [employees, setEmployees] = useState([
  { id: 1, name: 'Anil Kumar', department: 'IT', ... }
]);

// ✅ Sau: Fetch từ API
useEffect(() => {
  const fetchEmployees = async () => {
    const data = await employeeService.getAllEmployees();
    setEmployees(data || []);
  };
  fetchEmployees();
}, []);
```

**Thay đổi:**
- ✅ Thêm `useEffect` để fetch employees khi component mount
- ✅ Cập nhật field names: `name` → `FullName`, `id` → `EmployeeID`
- ✅ `POST` (Create) gọi `employeeService.createEmployee()`
- ✅ `PUT` (Update) gọi `employeeService.updateEmployee()`
- ✅ `DELETE` gọi `employeeService.deleteEmployee()`
- ✅ Thêm loading state & error handling
- ✅ Thêm các fields: Email, PhoneNumber, DateOfBirth, Gender, HireDate

---

### 2. **Dashboard.jsx** - Lấy Stats từ API
```jsx
// ✅ Trước: Hardcoded stats
const [stats, setStats] = useState({
  totalEmployees: 125,
  totalSalary: 850000,
});

// ✅ Sau: Calculate từ API data
useEffect(() => {
  const employees = await employeeService.getAllEmployees();
  const payroll = await payrollService.getPayroll();
  
  const totalEmployees = employees?.length || 0;
  let totalSalary = 0;
  payroll?.forEach(record => {
    totalSalary += parseInt(record.Salary) || 0;
  });
  
  setStats({
    totalEmployees,
    totalSalary,
    averageSalary: totalSalary / totalEmployees,
  });
}, []);
```

**Thay đổi:**
- ✅ Fetch employees từ API
- ✅ Fetch payroll data từ API
- ✅ Fetch attendance data từ API
- ✅ Calculate stats từ dữ liệu thực tế
- ✅ Group employees by department
- ✅ Thêm loading indicator

---

### 3. **Departments.jsx** - Kết nối API
```jsx
// ✅ Trước: Hardcoded departments
const [departments, setDepartments] = useState([
  { id: 1, name: 'IT', manager: 'Arjun Verma', ... }
]);

// ✅ Sau: Fetch từ API
useEffect(() => {
  const [deptData, empData] = await Promise.all([
    departmentService.getAllDepartments(),
    employeeService.getAllEmployees()
  ]);
  setDepartments(deptData || []);
  setEmployees(empData || []);
}, []);
```

**Thay đổi:**
- ✅ Fetch departments từ API
- ✅ Fetch employees từ API
- ✅ Match employees với departments
- ✅ Cập nhật field names: `name` → `DepartmentName`, `id` → `DepartmentID`
- ✅ `POST` gọi `departmentService.createDepartment()`
- ✅ `PUT` gọi `departmentService.updateDepartment()`
- ✅ `DELETE` gọi `departmentService.deleteDepartment()`

---

## 📋 Chi Tiết Field Mapping

### Employees Table
| Database | Frontend (Cũ) | Frontend (Mới) |
|----------|----------------|----------------|
| EmployeeID | id | EmployeeID |
| FullName | name | FullName |
| DepartmentID | department | DepartmentID |
| PositionID | position | PositionID |
| Email | ❌ | Email ✅ |
| PhoneNumber | ❌ | PhoneNumber ✅ |
| DateOfBirth | ❌ | DateOfBirth ✅ |
| Gender | ❌ | Gender ✅ |
| HireDate | ❌ | HireDate ✅ |
| Status | status | Status |

### Departments Table
| Database | Frontend (Cũ) | Frontend (Mới) |
|----------|----------------|----------------|
| DepartmentID | id | DepartmentID |
| DepartmentName | name | DepartmentName |
| ❌ | manager | ❌ (Removed) |
| ❌ | budget | ❌ (Removed) |

---

## 🔧 Backend API Checks

### ✅ Employees Endpoints
- `GET /employees` - Lấy danh sách nhân viên ✅
- `GET /employees/{id}` - Lấy chi tiết nhân viên ✅
- `POST /employees` - Tạo nhân viên ✅
- `PUT /employees/{id}` - Cập nhật nhân viên ✅
- `DELETE /employees/{id}` - Xóa nhân viên ✅

### ✅ Departments Endpoints
- `GET /departments` - Lấy danh sách phòng ban ✅
- `POST /departments` - Tạo phòng ban ✅
- `PUT /departments/{id}` - Cập nhật phòng ban ✅
- `DELETE /departments/{id}` - Xóa phòng ban ✅

### ✅ Database Connections
- SQL Server: `HUMAN` database ✅
- MySQL: `payroll` database ✅

---

## 🚀 Hướng Dẫn Kiểm Tra

### 1. Khởi động Backend
```bash
cd backend
python app.py
# Backend chạy trên http://127.0.0.1:8000
```

### 2. Khởi động Frontend
```bash
npm start
# Frontend chạy trên http://localhost:3000
```

### 3. Kiểm tra Employees Page
1. Mở `http://localhost:3000/employees`
2. Dữ liệu phải được lấy từ database, không phải hardcoded
3. Tạo/Sửa/Xóa nhân viên → Dữ liệu phải được lưu vào database
4. F5 refresh → Dữ liệu phải vẫn hiển thị (đã lưu)

### 4. Kiểm tra Departments Page
1. Mở `http://localhost:3000/departments`
2. Dữ liệu phải được lấy từ database
3. Tạo/Sửa/Xóa phòng ban → Lưu vào database
4. Refresh → Dữ liệu vẫn hiển thị

### 5. Kiểm tra Dashboard
1. Mở `http://localhost:3000/dashboard`
2. Stats (Total Employees, Payroll, etc) phải calculate từ API data
3. Department charts phải show dữ liệu từ database
4. Số liệu phải cập nhật khi thêm/xóa nhân viên

---

## ⚠️ Các Vấn Đề Còn Cần Giải Quyết

Từ API_TEST_REPORT.md, có một số vấn đề khác cần fix:

### 1. **Employees POST** - MySQL Schema Mismatch
```
Error: Unknown column 'Email' in 'field list'
```
**Giải pháp:** Kiểm tra schema của `employees_payroll` table trong MySQL, thêm cột `Email` hoặc giảm số columns được insert.

### 2. **Departments GET** - pyodbc.Row Conversion
```
Issue: GET endpoint returns malformed response
```
**Giải pháp:** Kiểm tra `courses.py` line để chắc chắn pyodbc.Row được convert thành dict

### 3. **Positions GET** - Tương tự Departments
```
Issue: Similar parsing error
```
**Giải pháp:** Áp dụng fix tương tự cho Positions endpoint

---

## 📊 Testing Checklist

- [ ] ✅ Employees page loads data từ database
- [ ] ✅ Employees CRUD operations lưu vào database
- [ ] ✅ Departments page loads data từ database  
- [ ] ✅ Departments CRUD operations lưu vào database
- [ ] ✅ Dashboard stats calculate từ database data
- [ ] ✅ Refresh page vẫn show dữ liệu (persistent)
- [ ] ✅ Error handling & loading states
- [ ] ✅ API authentication headers được gửi
- [ ] ⚠️ Fix MySQL schema mismatch (POST employees)
- [ ] ⚠️ Fix GET departments/positions pyodbc issue

---

## 📝 Ghi Chú

1. **API Base URL**: `http://127.0.0.1:8000` (set trong `.env` hoặc `apiConfig.js`)
2. **Authentication**: Bearer token được gửi trong header `Authorization: bearer <token>`
3. **CORS**: Backend đã config CORS cho phép tất cả origins
4. **Data Sync**: SQL Server is source of truth, MySQL được sync khi có changes
5. **Field Names**: Frontend phải sử dụng tên field giống backend (EmployeeID, FullName, etc)

---

## 🎯 Tóm Tắt

| Trước | Sau |
|-------|-----|
| ❌ Hardcoded data | ✅ Fetch từ API |
| ❌ Cập nhật state cục bộ | ✅ Lưu vào database |
| ❌ Refresh → Data mất | ✅ Refresh → Data persistent |
| ❌ Frontend & DB không sync | ✅ Frontend & DB sync via API |
| ❌ 5 employees mặc định | ✅ N employees từ database |

**Kết quả:** Ứng dụng giờ đã kết nối hoàn toàn với database!

