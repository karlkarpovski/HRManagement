import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../pages/Dashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard.jsx';
import PayrollDashboard from '../pages/PayrollDashboard.jsx';
import SystemAdminDashboard from '../pages/SystemAdminDashboard.jsx';
import Login from '../pages/Login.jsx';
import Employees from '../pages/Employees';
import Departments from '../pages/Departments';
import Reports from '../pages/Reports';
import Analytics from '../pages/Analytics.jsx';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../App.css';

const AUTH_STORAGE_KEY = 'hrms-authenticated';
const AUTH_ROLE_KEY = 'hrms-user-role';
const LEGACY_AUTH_STORAGE_KEY = 'hrms-manager-authenticated';

const DB_ROLE_TO_INTERNAL: Record<string, string> = {
  'admin': 'system-admin',
  'hr manager': 'manager',
  'payroll manager': 'payroll-manager',
  'employee': 'employee',
};

const normalizeRole = (value: string): string => {
  const role = String(value || '').trim().toLowerCase();
  return DB_ROLE_TO_INTERNAL[role] || 'manager';
};

const getInitialAuthState = (): boolean => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true' || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) === 'true';
  } catch { return false; }
};

const getInitialRole = () => {
  try {
    const storedRole = localStorage.getItem(AUTH_ROLE_KEY);
    if (storedRole) return normalizeRole(storedRole);
    if (localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) === 'true') return 'manager';
  } catch {}
  return 'manager';
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState);
  const [userRole, setUserRole] = useState(getInitialRole);
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const handleLoginSuccess = (userData: any): void => {
    const role = userData?.role || 'Employee';
    const normalizedRole = normalizeRole(role);
    setIsAuthenticated(true);
    setUserRole(normalizedRole);
    setCurrentUser(userData);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(AUTH_ROLE_KEY, role);
    } catch {}
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('manager');
    setCurrentUser(null);
    setActivePage('dashboard');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
      localStorage.removeItem('user');
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  // EMPLOYEE: dedicated Employee dashboard (standalone, no sidebar)
  if (userRole === 'employee') {
    return (
      <ThemeProvider>
        <EmployeeDashboard onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  // PAYROLL MANAGER: dedicated Payroll dashboard (standalone, no sidebar)
  if (userRole === 'payroll-manager') {
    return (
      <ThemeProvider>
        <PayrollDashboard onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  // ADMIN (system-admin): full sidebar with ALL pages:
  //   - Employee Management (Dashboard, Employees, Departments)
  //   - Reports & Analytics (Reports, Analytics)
  //   - Payroll Management (Payroll Dashboard) ← extra for Admin
  //   - System Administration (System Admin) ← extra for Admin
  const isAdmin = userRole === 'system-admin';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return <Employees />;
      case 'departments': return <Departments />;
      case 'reports': return <Reports />;
      case 'analytics': return <Analytics />;
      case 'payroll-dashboard': return <PayrollDashboard onLogout={handleLogout} embedded={isAdmin} />;
      case 'system-admin': return <SystemAdminDashboard onLogout={handleLogout} embedded={isAdmin} />;
      default: return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onLogout={handleLogout}
          userRole={userRole}
          isAdmin={isAdmin}
        />
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {renderPage()}
        </main>
      </div>
    </ThemeProvider>
  );
}