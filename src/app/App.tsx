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
import '../App.css';

const AUTH_STORAGE_KEY = 'hrms-authenticated';
const AUTH_ROLE_KEY = 'hrms-user-role';
const LEGACY_AUTH_STORAGE_KEY = 'hrms-manager-authenticated';

const normalizeRole = (value) => {
  const role = String(value || '').trim().toLowerCase();
  return role === 'employee' || role === 'system-admin' || role === 'manager' || role === 'payroll-manager'
    ? role
    : 'manager';
};

const getInitialAuthState = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true' || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const getInitialRole = () => {
  try {
    const storedRole = localStorage.getItem(AUTH_ROLE_KEY);
    if (storedRole) {
      return normalizeRole(storedRole);
    }

    if (localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) === 'true') {
      return 'manager';
    }
  } catch {
    // ignore storage errors
  }

  return 'manager';
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState);
  const [userRole, setUserRole] = useState(getInitialRole);

  const handleLoginSuccess = (nextRole) => {
    const normalizedRole = normalizeRole(nextRole);

    setIsAuthenticated(true);
    setUserRole(normalizedRole);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(AUTH_ROLE_KEY, normalizedRole);
    } catch {
      // ignore storage errors
    }

    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('manager');
    setActivePage('dashboard');

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (userRole === 'employee') {
    return <EmployeeDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'payroll-manager') {
    return <PayrollDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'system-admin') {
    return <SystemAdminDashboard onLogout={handleLogout} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      case 'departments':
        return <Departments />;
      case 'reports':
        return <Reports />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {renderPage()}
      </main>
    </div>
  );
}
