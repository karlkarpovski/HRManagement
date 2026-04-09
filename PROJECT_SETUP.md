# HR Management System

A complete Employee Management System built with React and modern web technologies.

## 🎯 Features

### 1. **Dashboard**
- Total employees count
- Total salary and average salary display
- Salary distribution charts
- Employee distribution by department
- Weekly attendance summary
- Quick action buttons

### 2. **Employee Management**
- ✅ Create new employees
- ✅ View all employees
- ✅ Edit employee details
- ✅ Delete employees
- ✅ Search by name or position
- ✅ Filter by department

### 3. **Attendance Management**
- ✅ Check-in / Check-out functionality
- ✅ Mark attendance as present/absent/late
- ✅ Attendance history
- ✅ Monthly statistics
- ✅ Date-wise tracking

### 4. **Payroll Management**
- ✅ Base salary management
- ✅ Bonus allocation
- ✅ Penalty/Deduction tracking
- ✅ Net salary calculation
- ✅ Monthly payroll processing
- ✅ Payslip generation

### 5. **Department Management**
- ✅ Create and manage departments
- ✅ Assign managers to departments
- ✅ Budget allocation
- ✅ Employee assignment
- ✅ Department statistics

### 6. **Reports & Analytics**
- ✅ Salary distribution reports
- ✅ Department-wise reports
- ✅ Attendance reports
- ✅ Payroll summary
- ✅ Export to PDF/Excel
- ✅ Print functionality

### 7. **Authentication**
- ✅ Login/Logout
- ✅ User authentication
- ✅ Role-based access control
- ✅ Session management

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Table.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   └── StatsCard.jsx
│
├── pages/               # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Employees.jsx
│   ├── Attendance.jsx
│   ├── Payroll.jsx
│   ├── Departments.jsx
│   └── Reports.jsx
│
├── services/            # API services
│   ├── authService.js
│   ├── employeeService.js
│   ├── attendanceService.js
│   ├── payrollService.js
│   └── departmentService.js
│
├── contexts/            # React Context
│   └── AuthContext.jsx
│
├── styles/              # CSS files
│   ├── components.css
│   ├── sidebar.css
│   ├── login.css
│   ├── dashboard.css
│   └── pages.css
│
├── App.jsx              # Main app component
├── App.css              # Main app styles
├── index.jsx            # App entry point
├── index.css            # Global styles
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project**
```bash
cd HRManagement
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

### Demo Credentials

- **Admin Account:**
  - Username: `admin`
  - Password: `any`

- **User Account:**
  - Username: `user`
  - Password: `any`

(Both logins work with any password for demo purposes)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📦 Dependencies

- **React** - UI library
- **React Hooks** - State management
- **CSS** - Styling (no dependencies)

## 🎨 UI Components

### Button
```jsx
<Button 
  label="Click Me" 
  onClick={handleClick} 
  variant="primary" 
/>
```

### Card
```jsx
<Card title="Card Title">
  Content here
</Card>
```

### Table
```jsx
<Table 
  columns={columns} 
  data={data} 
  onRowClick={handleRowClick}
/>
```

### Modal
```jsx
<Modal 
  isOpen={isOpen} 
  onClose={handleClose} 
  title="Modal Title"
>
  Modal content
</Modal>
```

### StatsCard
```jsx
<StatsCard 
  title="Total Employees" 
  value={125} 
  icon="👥"
  color="blue"
/>
```

## 🔐 Authentication Flow

1. User logs in with credentials
2. User data is saved to localStorage
3. AuthContext validates authentication
4. User is redirected to Dashboard
5. Sidebar navigation is available
6. Click Logout to clear session

## 📊 Mock Data

The system includes mock data for demonstration:
- 125 employees
- 4 departments
- Sample attendance and payroll records

Replace with real API calls in production.

## 🎯 Feature Examples

### Add Employee
1. Navigate to Employees page
2. Click "Add Employee" button
3. Fill in employee details
4. Click Save

### Mark Attendance
1. Go to Attendance page
2. Select employee and date
3. Click "Check-In" or "Check-Out"
4. View attendance history

### Process Payroll
1. Navigate to Payroll page
2. Select month
3. Edit salary, bonus, penalty
4. Click "Process Payroll"
5. Generate payslips

### View Reports
1. Go to Reports page
2. Select report type
3. Choose date range
4. Export or print

## 🎚️ Responsive Design

The application is fully responsive:
- Desktop (1920px and above)
- Laptop (1200px and above)
- Tablet (768px and above)
- Mobile (480px and above)

Sidebar collapses on small screens for better UX.

## 🔄 API Integration

Services are set up to connect to:
- Employee endpoints
- Attendance endpoints
- Payroll endpoints
- Department endpoints
- Attendance report endpoints

Update `API_BASE_URL` in services and connect to your backend.

## 📈 Future Enhancements

- [ ] Notification system
- [ ] Email integration
- [ ] Advanced filtering
- [ ] Data export (CSV, XML)
- [ ] User profiles
- [ ] Permission management
- [ ] Audit logs
- [ ] Department-wise dashboards

## 🐛 Troubleshooting

### Application won't start
```bash
npm install
npm start
```

### Session lost after refresh
- Check browser localStorage settings
- Verify AuthContext setup

### Styles not loading
- Clear browser cache
- Verify CSS files are in `src/styles/` folder

## 📝 Notes

- This is a frontend application
- Mock data is used for demonstration
- Connect real API endpoints in production
- Customize colors in CSS custom properties
- Update branding as needed

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions, please refer to the code comments and documentation.

---

**Last Updated:** April 2024
**Version:** 1.0.0
