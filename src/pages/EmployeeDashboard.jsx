import { useMemo, useRef, useState } from 'react';
import {
  BellRing,
  CalendarCheck2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
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
  MonitorUp,
} from 'lucide-react';
import '../styles/employee-dashboard.css';

const employee = {
  name: 'Amina Rahman',
  title: 'Senior Product Designer',
  department: 'Product Design',
  employeeId: 'EMP-2048',
  email: 'amina.rahman@northstarhr.com',
  phone: '+1 (555) 219-4088',
  address: '28 Riverbend Avenue, San Jose, CA',
  profilePicture: 'AR',
  role: 'Employee',
};

const attendance = {
  checkIn: '08:57 AM',
  checkOut: '05:41 PM',
  totalHours: '8h 44m',
};

const leaveBalance = [
  { label: 'Annual leave', value: '12 days', tone: 'good' },
  { label: 'Sick leave', value: '5 days', tone: 'warning' },
  { label: 'Personal leave', value: '3 days', tone: 'neutral' },
];

const payroll = {
  latestSalary: '$6,800',
  nextPayment: '30 Apr 2026',
  payCycle: 'Monthly payroll processed on the last business day.',
};

const recentRequests = [
  { id: 1, type: 'Leave request', date: '22 Apr 2026', status: 'Approved', detail: 'Annual leave for 25-26 Apr' },
  { id: 2, type: 'Reimbursement', date: '20 Apr 2026', status: 'Pending', detail: 'Travel expenses for client workshop' },
  { id: 3, type: 'Remote work', date: '16 Apr 2026', status: 'Rejected', detail: 'Work-from-home request for 19 Apr' },
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
  const sectionRefs = useRef({});

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
              <span>Check-in</span>
              <strong>{attendance.checkIn}</strong>
            </div>
            <div>
              <span>Check-out</span>
              <strong>{attendance.checkOut}</strong>
            </div>
            <div>
              <span>Total hours today</span>
              <strong>{attendance.totalHours}</strong>
            </div>
          </div>

          <div className='action-row'>
            <button className='action-primary' type='button'>
              Check In
            </button>
            <button className='action-secondary' type='button'>
              Check Out
            </button>
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

          <button className='action-secondary action-wide' type='button'>
            Request Leave
          </button>
        </SectionCard>
      </div>

      <div className='employee-dashboard-two-up'>
        <SectionCard id='payroll-summary' title='Payroll Summary' subtitle='Latest salary and upcoming payment details.'>
          <div className='payroll-summary-card'>
            <div>
              <span>Latest salary</span>
              <strong>{payroll.latestSalary}</strong>
            </div>
            <div>
              <span>Next payment</span>
              <strong>{payroll.nextPayment}</strong>
            </div>
          </div>

          <p className='muted-copy'>{payroll.payCycle}</p>

          <button className='action-primary action-wide' type='button'>
            View Payslip
          </button>
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

      <SectionCard id='requests' title='Recent Requests' subtitle='Track your latest leave and reimbursement requests.'>
        <div className='request-list'>
          {recentRequests.map((item) => {
            const meta = statusMeta[item.status];
            const StatusIcon = meta.icon;

            return (
              <article key={item.id} className='request-item'>
                <div>
                  <strong>{item.type}</strong>
                  <p>{item.detail}</p>
                  <span>{item.date}</span>
                </div>
                <div className={`status-pill ${meta.className}`}>
                  <StatusIcon size={14} />
                  {item.status}
                </div>
              </article>
            );
          })}
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
            <div>
              <span>Employee ID</span>
              <strong>{employee.employeeId}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{employee.department}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{employee.role}</strong>
            </div>
          </div>
        </div>

        <form className='employee-card profile-form'>
          <h3>Edit contact information</h3>
          <label>
            <span>Email</span>
            <input type='email' defaultValue={employee.email} />
          </label>
          <label>
            <span>Phone</span>
            <input type='tel' defaultValue={employee.phone} />
          </label>
          <label className='full-width'>
            <span>Address</span>
            <textarea rows='4' defaultValue={employee.address} />
          </label>
          <div className='action-row'>
            <button className='action-primary' type='button'>
              Save Changes
            </button>
            <button className='action-secondary' type='button' onClick={() => setActiveView('dashboard')}>
              Back to Dashboard
            </button>
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
            <Avatar label='AR' />
            <span>
              {employee.name}
              <ChevronDown size={16} />
            </span>
          </button>

          {avatarMenuOpen && (
            <div className='avatar-dropdown'>
              <button type='button' onClick={() => jumpTo('profile')}>
                <UserCircle2 size={16} />
                Profile
              </button>
              <button type='button' onClick={() => jumpTo('profile')}>
                <Settings size={16} />
                Settings
              </button>
              <button type='button' onClick={onLogout}>
                <LogOut size={16} />
                Logout
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
              <span>Next shift: </span>
              <strong>Mon, 29 Apr 2026</strong>
            </div>
            <button type='button' className='logout-link' onClick={onLogout}>
              <LogOut size={16} />
              Sign out
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