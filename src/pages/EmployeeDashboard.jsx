import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BellRing,
  CalendarCheck2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Settings,
  Sun,
  UserRound,
  ClipboardList,
  Wallet,
  Clock3,
  PlaneTakeoff,
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  CircleCheckBig,
  CircleAlert,
  CircleX,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api/axios';
import '../styles/employee-dashboard.css';

const statusMeta = {
  Approved: { icon: CircleCheckBig, className: 'is-approved' },
  Pending: { icon: CircleAlert, className: 'is-pending' },
  Rejected: { icon: CircleX, className: 'is-rejected' },
};

const roleNav = [
  { label: 'Dashboard', icon: LayoutDashboard, target: 'dashboard' },
  { label: 'Profile', icon: UserRound, target: 'profile' },
  { label: 'Attendance', icon: CalendarCheck2, target: 'attendance' },
  { label: 'Payroll', icon: Wallet, target: 'payroll' },
  { label: 'Requests', icon: ClipboardList, target: 'requests' },
];

function Avatar({ label }) {
  return <div className='employee-avatar'>{label}</div>;
}

function SectionCard({ id, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`employee-card ${className}`.trim()}>
      <div className='employee-card-header'>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function EmployeeDashboard({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const sectionRefs = useRef({});

  // Real employee data from API
  const [employeeData, setEmployeeData] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Get logged-in user info
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        
        // Fetch employee from API by ID
        const empRes = await api.get(`/employees/${user.id}`);
        const emp = empRes.data;
        
        setEmployeeData({
          name: emp.FullName || user.fullname || user.username,
          title: emp.PositionName || 'Employee',
          department: emp.DepartmentName || `Department ${emp.DepartmentID || ''}`,
          employeeId: `EMP-${emp.EmployeeID || user.id}`,
          email: emp.Email || '',
          phone: emp.Phone || '',
          address: emp.Address || '',
          profilePicture: (emp.FullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2),
          role: user.role || 'Employee',
        });

        // Fetch attendance - DB columns: AttendanceID, EmployeeID, WorkDays, AbsentDays, LeaveDays, AttendanceMonth
        try {
          const attRes = await api.get(`/attendance/${user.id}`);
          const attArr = Array.isArray(attRes.data) ? attRes.data : [];
          if (attArr.length > 0) {
            const latest = attArr[0];
            setAttendance({
              workDays: latest.WorkDays || 0,
              absentDays: latest.AbsentDays || 0,
              leaveDays: latest.LeaveDays || 0,
              month: latest.AttendanceMonth || 'N/A',
            });
          } else {
            setAttendance({ workDays: 0, absentDays: 0, leaveDays: 0, month: 'N/A' });
          }
        } catch {
          setAttendance({ workDays: 0, absentDays: 0, leaveDays: 0, month: 'N/A' });
        }

        // Fetch payroll history
        try {
          const payRes = await api.get(`/payroll/${user.id}/history`);
          setPayrollHistory(Array.isArray(payRes.data) ? payRes.data : []);
        } catch {
          setPayrollHistory([]);
        }
      } catch (err) {
        console.error('Failed to load employee data:', err);
        // Fallback to localStorage user
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          setEmployeeData({
            name: user.fullname || user.username || 'Employee',
            title: user.role || 'Employee',
            department: 'General',
            employeeId: `EMP-${user.id || '0000'}`,
            email: '',
            phone: '',
            address: '',
            profilePicture: (user.fullname || 'EM').split(' ').map(w => w[0]).join('').slice(0, 2),
            role: user.role || 'Employee',
          });
        } catch {
          // Last resort fallback
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, []);

  const employee = employeeData || {
    name: 'Employee',
    title: 'Employee',
    department: 'General',
    employeeId: 'EMP-0000',
    email: '',
    phone: '',
    address: '',
    profilePicture: 'EM',
    role: 'Employee',
  };

  const currentAttendance = attendance || { workDays: 0, absentDays: 0, leaveDays: 0, month: 'N/A' };

  const latestPayroll = useMemo(() => {
    if (payrollHistory.length === 0) return null;
    return payrollHistory[0];
  }, [payrollHistory]);

  const leaveBalance = [
    { label: 'Annual leave', value: '12 days', tone: 'good' },
    { label: 'Sick leave', value: '5 days', tone: 'warning' },
    { label: 'Personal leave', value: '3 days', tone: 'neutral' },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Quarterly performance reviews',
      text: 'Review cycles open next Monday. Please update your self-assessment before the deadline.',
    },
    {
      id: 2,
      title: 'Payroll processing reminder',
      text: 'April payroll will be processed on 30 Apr. Submit any reimbursement changes before 4 PM.',
    },
    {
      id: 3,
      title: 'Office holiday notice',
      text: 'The office will be closed on 1 May for the public holiday. Work schedules will remain flexible.',
    },
  ];

  const navItems = useMemo(() => roleNav, []);

  const jumpTo = (target) => {
    if (target === 'profile') {
      setActiveView('profile');
      setAvatarMenuOpen(false);
      return;
    }
    setActiveView('dashboard');
    if (typeof document !== 'undefined') {
      const section = document.getElementById(target);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
    setAvatarMenuOpen(false);
  };

  const renderDashboard = () => (
    <div className='employee-dashboard-grid'>
      <SectionCard id='dashboard' title='Personal Overview' subtitle='Your current HR snapshot at a glance.' className='overview-card'>
        <div className='overview-layout'>
          <div className='overview-profile'>
            <Avatar label={employee.profilePicture} />
            <div>
              <h2>{employee.name}</h2>
              <p>{employee.title}</p>
            </div>
          </div>
          <div className='overview-meta'>
            <div>
              <span>Department</span>
              <strong>{employee.department}</strong>
            </div>
            <div>
              <span>Employee ID</span>
              <strong>{employee.employeeId}</strong>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className='employee-dashboard-two-up'>
        <SectionCard id='attendance' title='Attendance Summary' subtitle='Track your workday and check in or out quickly.'>
          <div className='attendance-stats'>
            <div>
              <span>Work Days</span>
              <strong>{currentAttendance.workDays}</strong>
            </div>
            <div>
              <span>Absent Days</span>
              <strong>{currentAttendance.absentDays}</strong>
            </div>
            <div>
              <span>Leave Days</span>
              <strong>{currentAttendance.leaveDays}</strong>
            </div>
          </div>
          <div className='action-row'>
            <button className='action-primary' type='button'>Check In</button>
            <button className='action-secondary' type='button'>Check Out</button>
          </div>
        </SectionCard>

        <SectionCard id='payroll' title='Leave Balance' subtitle='Your remaining time off for the current cycle.'>
          <div className='balance-list'>
            {leaveBalance.map((item) => (
              <div key={item.label} className={`balance-item ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <button className='action-secondary action-wide' type='button'>Request Leave</button>
        </SectionCard>
      </div>

      <div className='employee-dashboard-two-up'>
        <SectionCard id='payroll-summary' title='Payroll Summary' subtitle='Latest salary and upcoming payment details.'>
          <div className='payroll-summary-card'>
            <div>
              <span>Latest salary</span>
              <strong>{latestPayroll ? `${Number(latestPayroll.NetSalary || 0).toLocaleString()}₫` : '0₫'}</strong>
            </div>
            <div>
              <span>Pay period</span>
              <strong>{latestPayroll?.SalaryMonth ? String(latestPayroll.SalaryMonth).slice(0, 7) : 'N/A'}</strong>
            </div>
          </div>
          <p className='muted-copy'>Monthly payroll processed on the last business day.</p>
          <button className='action-primary action-wide' type='button'>View Payslip</button>
        </SectionCard>

        <SectionCard id='announcements' title='Announcements' subtitle='Company updates and HR reminders.'>
          <div className='announcement-list'>
            {announcements.map((item) => (
              <article key={item.id} className='announcement-item'>
                <div className='announcement-dot' />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard id='requests' title='Recent Payroll History'>
        <div className='request-list'>
          {payrollHistory.length > 0 ? (
            payrollHistory.slice(0, 5).map((item, i) => (
              <article key={i} className='request-item'>
                <div>
                  <strong>Kỳ lương {item.SalaryMonth ? String(item.SalaryMonth).slice(0, 7) : '#' + (item.SalaryID || i)}</strong>
                  <p>Net: {Number(item.NetSalary || 0).toLocaleString()}₫</p>
                  <span>Base: {Number(item.BaseSalary || 0).toLocaleString()}₫</span>
                </div>
                <div className='status-pill is-approved'>
                  <BadgeCheck size={14} />
                  Processed
                </div>
              </article>
            ))
          ) : (
            <p style={{ color: '#8ca0af', padding: 12 }}>No payroll history available.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderProfile = () => (
    <section className='employee-profile-view'>
      <div className='profile-hero employee-card'>
        <Avatar label={employee.profilePicture} />
        <div>
          <p>Profile</p>
          <h2>{employee.name}</h2>
          <span>{employee.title}</span>
        </div>
      </div>

      <div className='profile-grid'>
        <div className='employee-card profile-readonly'>
          <h3>Read-only details</h3>
          <div className='profile-detail-list'>
            <div><span>Employee ID</span><strong>{employee.employeeId}</strong></div>
            <div><span>Department</span><strong>{employee.department}</strong></div>
            <div><span>Role</span><strong>{employee.role}</strong></div>
          </div>
        </div>

        <form className='employee-card profile-form'>
          <h3>Contact information</h3>
          <label>
            <span>Email</span>
            <input type='email' defaultValue={employee.email} placeholder='Not available' />
          </label>
          <label>
            <span>Phone</span>
            <input type='tel' defaultValue={employee.phone} placeholder='Not available' />
          </label>
          <label className='full-width'>
            <span>Address</span>
            <textarea rows='4' defaultValue={employee.address} placeholder='Not available' />
          </label>
          <div className='action-row'>
            <button className='action-primary' type='button'>Save Changes</button>
            <button className='action-secondary' type='button' onClick={() => setActiveView('dashboard')}>Back to Dashboard</button>
          </div>
        </form>
      </div>
    </section>
  );

  return (
    <div className='employee-dashboard-shell'>
      <header className='employee-topbar'>
        <div className='topbar-brand'>
          <button type='button' className='mobile-menu-button' onClick={() => setMobileMenuOpen((current) => !current)}>
            <Menu size={20} />
          </button>
          <div className='brand-mark'>HRMS</div>
          <div>
            <strong>Northstar HR</strong>
            <span>Employee Portal</span>
          </div>
        </div>

        <nav className='topbar-nav' aria-label='Primary navigation'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === 'profile' ? item.target === 'profile' : item.target === 'dashboard';
            return (
              <button key={item.label} type='button' className={`topbar-link ${isActive ? 'active' : ''}`} onClick={() => jumpTo(item.target)}>
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className='avatar-menu-wrap'>
          <button type='button' className='avatar-menu-trigger' onClick={() => setAvatarMenuOpen((current) => !current)}>
            <Avatar label={employee.profilePicture} />
            <span>
              {employee.name}
              <ChevronDown size={16} />
            </span>
          </button>

          {avatarMenuOpen && (
            <div className='avatar-dropdown'>
              <button type='button' onClick={() => jumpTo('profile')}>
                <UserCircle2 size={16} /> Profile
              </button>
              <button type='button' onClick={() => jumpTo('profile')}>
                <Settings size={16} /> Settings
              </button>
              <button type='button' onClick={toggleTheme}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                {isDark ? 'Light' : 'Dark'} mode
              </button>
              <button type='button' onClick={onLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className='employee-layout'>
        <aside className={`employee-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className='sidebar-header-card'>
            <Avatar label={employee.profilePicture} />
            <div>
              <strong>{employee.name}</strong>
              <span>{employee.department}</span>
            </div>
          </div>
          <div className='sidebar-footer-card'>
            <div>
              <span>Employee ID: </span>
              <strong>{employee.employeeId}</strong>
            </div>
            <button type='button' className='logout-link' onClick={onLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>

        <main className='employee-content'>
          {activeView === 'profile' ? renderProfile() : renderDashboard()}
        </main>
      </div>
      <div className='mobile-backdrop' aria-hidden='true' onClick={() => setMobileMenuOpen(false)} />
    </div>
  );
}