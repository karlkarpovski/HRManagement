import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BellRing,
  Database,
  KeyRound,
  LayoutGrid,
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
  ServerCog,
  HardDriveDownload,
  FileClock,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/system-admin-dashboard.css';

const overviewStats = [
  { label: 'Managed users', value: '248', note: 'Active and disabled accounts', tone: 'primary' },
  { label: 'Permission sets', value: '14', note: 'Role templates in use', tone: 'success' },
  { label: 'Open alerts', value: '5', note: 'Security and access issues', tone: 'warning' },
  { label: 'Audit events', value: '1,284', note: 'Logged in the last 7 days', tone: 'neutral' },
];

const userQueue = [
  { name: 'Quang Tran', username: 'hr_quang', role: 'HR Manager', status: 'Active', action: 'Review access' },
  { name: 'Lan Pham', username: 'pay_lan', role: 'Payroll Manager', status: 'Active', action: 'Assign limits' },
  { name: 'Minh Nguyen', username: 'emp_minh', role: 'Employee', status: 'Pending reset', action: 'Reset password' },
  { name: 'Admin Account', username: 'admin_thanh', role: 'System Admin', status: 'Locked', action: 'Unlock account' },
];

const permissionMatrix = [
  { role: 'HR Manager', permissions: ['Employee CRUD', 'Department CRUD', 'Reports', 'Analytics'] },
  { role: 'Payroll Manager', permissions: ['Payroll runs', 'Attendance review', 'Payroll history'] },
  { role: 'Employee', permissions: ['Profile view', 'Leave requests', 'Personal payroll'] },
  { role: 'System Admin', permissions: ['User management', 'Permissions', 'System settings', 'Audit logs'] },
];

const systemHealth = [
  { label: 'API services', value: 'Healthy', icon: Database },
  { label: 'Auth service', value: 'Healthy', icon: ShieldCheck },
  { label: 'Database sync', value: '2 min ago', icon: HardDriveDownload },
  { label: 'Audit queue', value: '11 pending', icon: FileClock },
];

const securitySignals = [
  '5 failed login attempts from the same IP were blocked.',
  '2 users require password rotation before Friday.',
  '1 role permission change is pending approval.',
];

const navigation = [
  { label: 'Overview', target: 'overview' },
  { label: 'Users', target: 'users' },
  { label: 'Permissions', target: 'permissions' },
  { label: 'Health', target: 'health' },
  { label: 'Audit', target: 'audit' },
];

export default function SystemAdminDashboard({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navItems = useMemo(() => navigation, []);

  const scrollToSection = (target) => {
    if (typeof document === 'undefined') {
      return;
    }

    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

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
            <Menu size={18} />
            Menu
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
              <LogOut size={16} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      <main className='system-admin-main'>
        <section className='system-admin-hero' id='overview'>
          <div>
            <span className='system-admin-pill'>Administration</span>
            <h1>Directly manage users, permissions, and system health from one console.</h1>
            <p>
              This workspace is isolated from HR and payroll workflows so the System Admin role can focus on access
              control, security oversight, and operational settings.
            </p>
          </div>

          <div className='system-admin-hero-actions'>
            <button type='button' className='system-admin-primary-action'>
              <UserRoundPlus size={16} />
              Create user
            </button>
            <button type='button' className='system-admin-secondary-action'>
              <LockKeyhole size={16} />
              Review access policy
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
              <button type='button' className='panel-link'>
                Invite new account
              </button>
            </div>

            <div className='system-admin-user-list'>
              {userQueue.map((user) => (
                <div key={user.username} className='system-admin-user-card'>
                  <div className='system-admin-user-avatar'>
                    <UserCog size={16} />
                  </div>
                  <div className='system-admin-user-copy'>
                    <strong>{user.name}</strong>
                    <span>{user.username}</span>
                    <p>
                      {user.role} · {user.status}
                    </p>
                  </div>
                  <button type='button' className='system-admin-inline-action'>
                    {user.action}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className='system-admin-panel' id='permissions'>
            <div className='system-admin-panel-header'>
              <div>
                <span className='system-admin-panel-kicker'>Permissions</span>
                <h2>Role permission matrix</h2>
              </div>
              <button type='button' className='panel-link'>
                Edit templates
              </button>
            </div>

            <div className='system-admin-permission-list'>
              {permissionMatrix.map((item) => (
                <div key={item.role} className='system-admin-permission-card'>
                  <strong>{item.role}</strong>
                  <div className='system-admin-chip-row'>
                    {item.permissions.map((permission) => (
                      <span key={permission} className='system-admin-chip'>
                        {permission}
                      </span>
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
              <button type='button' className='panel-link'>
                Open audit log
              </button>
            </div>

            <div className='system-admin-alert-stack'>
              {securitySignals.map((signal) => (
                <div key={signal} className='system-admin-alert-item'>
                  <CircleAlert size={16} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>

            <div className='system-admin-metrics-row'>
              <div>
                <Activity size={16} />
                <span>Realtime monitoring enabled</span>
              </div>
              <div>
                <BellRing size={16} />
                <span>3 alert channels connected</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}