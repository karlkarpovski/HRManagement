import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BellRing,
  Database,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  UserCog,
  UserRoundPlus,
  CircleAlert,
  HardDriveDownload,
  FileClock,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api/axios';
import '../styles/system-admin-dashboard.css';

const navigation = [
  { label: 'Overview', target: 'overview' },
  { label: 'Users', target: 'users' },
  { label: 'Permissions', target: 'permissions' },
  { label: 'Health', target: 'health' },
  { label: 'Audit', target: 'audit' },
];

export default function SystemAdminDashboard({ onLogout, embedded }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navItems = useMemo(() => navigation, []);

  const [employees, setEmployees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, alertRes, deptRes] = await Promise.all([
          api.get('/employees'),
          api.get('/alerts'),
          api.get('/departments'),
        ]);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        setAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeUsers = employees.length;
  const deptCount = departments.length;
  const alertCount = alerts.length;

  const permissionMatrix = [
    { role: 'Admin', permissions: ['User management', 'Permissions', 'System settings', 'Audit logs'] },
    { role: 'HR Manager', permissions: ['Employee CRUD', 'Department CRUD', 'Reports', 'Analytics'] },
    { role: 'Payroll Manager', permissions: ['Payroll runs', 'Attendance review', 'Payroll history'] },
    { role: 'Employee', permissions: ['Profile view', 'Leave requests', 'Personal payroll'] },
  ];

  const systemHealth = [
    { label: 'API services', value: 'Healthy', icon: Database },
    { label: 'Auth service', value: 'Healthy', icon: ShieldCheck },
    { label: 'Database sync', value: 'Active', icon: HardDriveDownload },
    { label: 'System records', value: `${employees.length} employees`, icon: FileClock },
  ];

  const securitySignals = useMemo(() => {
    return alerts.slice(0, 5).map((a) => `${a.type || 'Alert'}: ${a.message || ''}`);
  }, [alerts]);

  const overviewStats = [
    { label: 'Managed users', value: String(activeUsers), note: 'Total employee accounts', tone: 'primary' },
    { label: 'Departments', value: String(deptCount), note: 'Active departments', tone: 'success' },
    { label: 'Open alerts', value: String(alertCount), note: 'System notifications', tone: 'warning' },
    { label: 'System health', value: 'Online', note: 'All services operational', tone: 'neutral' },
  ];

  const userQueue = useMemo(() => {
    return employees.slice(0, 5).map((emp) => ({
      name: emp.FullName || 'Unknown',
      username: `emp_${emp.EmployeeID}`,
      role: emp.PositionName || 'Employee',
      status: emp.Status || 'Active',
      action: 'Review',
    }));
  }, [employees]);

  const scrollToSection = (target) => {
    if (typeof document === 'undefined') return;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  // The main content (without rail shell)
  const mainContent = (
    <>
      <section className='system-admin-hero' id='overview'>
        <div>
          <span className='system-admin-pill'>Administration</span>
          <h1>Directly manage users, permissions, and system health from one console.</h1>
          <p>This workspace is focused on access control, security oversight, and operational settings.</p>
        </div>
        <div className='system-admin-hero-actions'>
          <button type='button' className='system-admin-primary-action'>
            <UserRoundPlus size={16} /> Create user
          </button>
          <button type='button' className='system-admin-secondary-action'>
            <LockKeyhole size={16} /> Review access policy
          </button>
        </div>
      </section>

      <section className='system-admin-kpi-grid' aria-label='System admin summary metrics'>
        {overviewStats.map((stat) => (
          <article key={stat.label} className={`system-admin-kpi-card ${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className='system-admin-content-grid'>
        <article className='system-admin-panel' id='users'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>Users</span>
              <h2>User management</h2>
            </div>
          </div>
          <div className='system-admin-user-list'>
            {userQueue.map((user) => (
              <div key={user.username} className='system-admin-user-card'>
                <div className='system-admin-user-avatar'><UserCog size={16} /></div>
                <div className='system-admin-user-copy'>
                  <strong>{user.name}</strong>
                  <span>{user.username}</span>
                  <p>{user.role} · {user.status}</p>
                </div>
                <button type='button' className='system-admin-inline-action'>{user.action}</button>
              </div>
            ))}
            {userQueue.length === 0 && <p style={{ padding: 16, color: '#8ba3b8' }}>No users found</p>}
          </div>
        </article>

        <article className='system-admin-panel' id='permissions'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>Permissions</span>
              <h2>Role permission matrix</h2>
            </div>
          </div>
          <div className='system-admin-permission-list'>
            {permissionMatrix.map((item) => (
              <div key={item.role} className='system-admin-permission-card'>
                <strong>{item.role}</strong>
                <div className='system-admin-chip-row'>
                  {item.permissions.map((permission) => (
                    <span key={permission} className='system-admin-chip'>{permission}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className='system-admin-footer-grid'>
        <article className='system-admin-panel' id='health'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>System health</span>
              <h2>Service status</h2>
            </div>
          </div>
          <div className='system-admin-health-grid'>
            {systemHealth.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className='system-admin-health-card'>
                  <Icon size={16} />
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className='system-admin-panel' id='audit'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>Security</span>
              <h2>Audit and alerts</h2>
            </div>
          </div>
          <div className='system-admin-alert-stack'>
            {securitySignals.length > 0 ? (
              securitySignals.map((signal, i) => (
                <div key={i} className='system-admin-alert-item'>
                  <CircleAlert size={16} />
                  <span>{signal}</span>
                </div>
              ))
            ) : (
              <p style={{ padding: 16, color: '#8ba3b8' }}>No active alerts</p>
            )}
          </div>
          <div className='system-admin-metrics-row'>
            <div>
              <Activity size={16} />
              <span>System monitoring active</span>
            </div>
            <div>
              <BellRing size={16} />
              <span>{alertCount} alert channels</span>
            </div>
          </div>
        </article>
      </section>
    </>
  );

  if (embedded) {
    // Embedded mode: just the content, rail navigation is provided by the main sidebar
    return (
      <div className='system-admin-embedded'>
        <div className='system-admin-main' style={{ padding: 0 }}>
          {mainContent}
        </div>
      </div>
    );
  }

  // Standalone mode with rail (for direct access, standalone view)
  return (
    <div className='system-admin-shell'>
      <aside className={`system-admin-rail ${menuOpen ? 'open' : ''}`}>
        <div className='system-admin-rail-top'>
          <div className='system-admin-brand'>
            <span className='system-admin-brand-mark'>A</span>
            <div>
              <strong>System Admin</strong>
              <span>Full control console</span>
            </div>
          </div>
          <button type='button' className='system-admin-menu-toggle' onClick={() => setMenuOpen((current) => !current)}>
            <Menu size={18} /> Menu
          </button>
        </div>
        <nav className='system-admin-nav'>
          {navItems.map((item) => (
            <button key={item.target} type='button' className='system-admin-nav-item' onClick={() => scrollToSection(item.target)}>
              <span>{item.label}</span>
              <ArrowRight size={16} />
            </button>
          ))}
        </nav>
        <div className='system-admin-rail-footer'>
          <div>
            <span>Role</span>
            <strong>System Admin</strong>
          </div>
          <button type='button' className='system-admin-theme-toggle' onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
          {onLogout && (
            <button type='button' className='system-admin-logout' onClick={onLogout}>
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </aside>
      <main className='system-admin-main'>
        {mainContent}
      </main>
    </div>
  );
}