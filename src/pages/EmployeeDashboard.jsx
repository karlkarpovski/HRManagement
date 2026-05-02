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
import { formatVND } from '../utils/currency';
import api from '../api/axios';
import '../styles/employee-dashboard.css';

const statusMeta = {
  Approved: { icon: CircleCheckBig, className: 'is-approved' },
  Pending: { icon: CircleAlert, className: 'is-pending' },
  Rejected: { icon: CircleX, className: 'is-rejected' },
};

const roleNav = [
  { label: 'Bảng Điều Khiển', icon: LayoutDashboard, target: 'dashboard' },
  { label: 'Hồ Sơ', icon: UserRound, target: 'profile' },
  { label: 'Chấm Công', icon: CalendarCheck2, target: 'attendance' },
  { label: 'Lương', icon: Wallet, target: 'payroll' },
  { label: 'Yêu Cầu', icon: ClipboardList, target: 'requests' },
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
          title: emp.PositionName || 'Nhân viên',
          department: emp.DepartmentName || `Phòng ${emp.DepartmentID || ''}`,
          employeeId: `EMP-${emp.EmployeeID || user.id}`,
          email: emp.Email || '',
          phone: emp.Phone || '',
          address: emp.Address || '',
          profilePicture: (emp.FullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2),
          role: user.role || 'Nhân viên',
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
            name: user.fullname || user.username || 'Nhân viên',
            title: user.role || 'Nhân viên',
            department: 'Tổng quát',
            employeeId: `EMP-${user.id || '0000'}`,
            email: '',
            phone: '',
            address: '',
            profilePicture: (user.fullname || 'EM').split(' ').map(w => w[0]).join('').slice(0, 2),
            role: user.role || 'Nhân viên',
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
    name: 'Nhân viên',
    title: 'Nhân viên',
    department: 'Tổng quát',
    employeeId: 'EMP-0000',
    email: '',
    phone: '',
    address: '',
    profilePicture: 'EM',
    role: 'Nhân viên',
  };

  const currentAttendance = attendance || { workDays: 0, absentDays: 0, leaveDays: 0, month: 'N/A' };

  const latestPayroll = useMemo(() => {
    if (payrollHistory.length === 0) return null;
    return payrollHistory[0];
  }, [payrollHistory]);

  const leaveBalance = [
    { label: 'Nghỉ hàng năm', value: '12 ngày', tone: 'good' },
    { label: 'Nghỉ ốm', value: '5 ngày', tone: 'warning' },
    { label: 'Nghỉ cá nhân', value: '3 ngày', tone: 'neutral' },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Đánh Giá Hiệu Suất Hàng Quý',
      text: 'Chu kỳ đánh giá mở vào thứ Hai tới. Vui lòng cập nhật đánh giá bản thân trước hạn chót.',
    },
    {
      id: 2,
      title: 'Nhắc Nhở Xử Lý Lương',
      text: 'Lương tháng 4 sẽ được xử lý vào ngày 30/4. Hãy gửi các thay đổi hoàn lại trước 4 giờ chiều.',
    },
    {
      id: 3,
      title: 'Thông Báo Nghỉ Lễ',
      text: 'Văn phòng sẽ đóng cửa vào ngày 1/5 cho kỳ nghỉ lễ. Lịch trình làm việc sẽ vẫn linh hoạt.',
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
      <SectionCard id='dashboard' title='Tổng Quan Nhân Viên' subtitle='Cái nhìn tổng quan nhân sự của bạn tại một cái nhìn.' className='overview-card'>
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
              <span>Phòng Ban</span>
              <strong>{employee.department}</strong>
            </div>
            <div>
              <span>Mã Nhân Viên</span>
              <strong>{employee.employeeId}</strong>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className='employee-dashboard-two-up'>
        <SectionCard id='attendance' title='Tổng Kết Chấm Công' subtitle='Theo dõi ngày làm việc và chấm công nhanh chóng.'>
          <div className='attendance-stats'>
            <div>
              <span>Ngày Làm Việc</span>
              <strong>{currentAttendance.workDays}</strong>
            </div>
            <div>
              <span>Ngày Vắng</span>
              <strong>{currentAttendance.absentDays}</strong>
            </div>
            <div>
              <span>Ngày Nghỉ Phép</span>
              <strong>{currentAttendance.leaveDays}</strong>
            </div>
          </div>
          <div className='action-row'>
            <button className='action-primary' type='button'>Chấm Công Vào</button>
            <button className='action-secondary' type='button'>Chấm Công Ra</button>
          </div>
        </SectionCard>

        <SectionCard id='payroll' title='Số Dư Nghỉ Phép' subtitle='Số ngày nghỉ phép còn lại trong kỳ hiện tại.'>
          <div className='balance-list'>
            {leaveBalance.map((item) => (
              <div key={item.label} className={`balance-item ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <button className='action-secondary action-wide' type='button'>Yêu Cầu Nghỉ Phép</button>
        </SectionCard>
      </div>

      <div className='employee-dashboard-two-up'>
        <SectionCard id='payroll-summary' title='Tổng Quan Lương' subtitle='Lương mới nhất và chi tiết thanh toán sắp tới.'>
          <div className='payroll-summary-card'>
            <div>
              <span>Lương Mới Nhất</span>
              <strong>{latestPayroll ? formatVND(latestPayroll.NetSalary) : formatVND(0)}</strong>
            </div>
            <div>
              <span>Kỳ Lương</span>
              <strong>{latestPayroll?.SalaryMonth ? String(latestPayroll.SalaryMonth).slice(0, 7) : 'N/A'}</strong>
            </div>
          </div>
          <p className='muted-copy'>Lương tháng được xử lý vào ngày làm việc cuối cùng.</p>
          <button className='action-primary action-wide' type='button'>Xem Phiếu Lương</button>
        </SectionCard>

        <SectionCard id='announcements' title='Thông Báo' subtitle='Cập nhật công ty và nhắc nhở nhân sự.'>
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

      <SectionCard id='requests' title='Lịch Sử Lương Gần Đây'>
        <div className='request-list'>
          {payrollHistory.length > 0 ? (
            payrollHistory.slice(0, 5).map((item, i) => (
              <article key={i} className='request-item'>
                <div>
                  <strong>Kỳ lương {item.SalaryMonth ? String(item.SalaryMonth).slice(0, 7) : '#' + (item.SalaryID || i)}</strong>
                  <p>Net: {formatVND(item.NetSalary)}</p>
                  <span>Base: {formatVND(item.BaseSalary)}</span>
                </div>
                <div className='status-pill is-approved'>
                  <BadgeCheck size={14} />
                  Đã Duyệt
                </div>
              </article>
            ))
          ) : (
            <p style={{ color: '#8ca0af', padding: 12 }}>Không có lịch sử lương.</p>
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
          <p>Hồ Sơ</p>
          <h2>{employee.name}</h2>
          <span>{employee.title}</span>
        </div>
      </div>

      <div className='profile-grid'>
        <div className='employee-card profile-readonly'>
          <h3>Chi Tiết Chỉ Đọc</h3>
          <div className='profile-detail-list'>
            <div><span>Mã Nhân Viên</span><strong>{employee.employeeId}</strong></div>
            <div><span>Phòng Ban</span><strong>{employee.department}</strong></div>
            <div><span>Vai Trò</span><strong>{employee.role}</strong></div>
          </div>
        </div>

        <form className='employee-card profile-form'>
          <h3>Thông Tin Liên Hệ</h3>
          <label>
            <span>Thư Điện Tử</span>
            <input type='email' defaultValue={employee.email} placeholder='Không có sẵn' />
          </label>
          <label>
            <span>Điện Thoại</span>
            <input type='tel' defaultValue={employee.phone} placeholder='Không có sẵn' />
          </label>
          <label className='full-width'>
            <span>Địa Chỉ</span>
            <textarea rows='4' defaultValue={employee.address} placeholder='Không có sẵn' />
          </label>
          <div className='action-row'>
            <button className='action-primary' type='button'>Lưu Thay Đổi</button>
            <button className='action-secondary' type='button' onClick={() => setActiveView('dashboard')}>Quay Lại Bảng Điều Khiển</button>
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
            <strong>HRMS</strong>
            <span>Cổng Nhân Viên</span>
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
                <UserCircle2 size={16} /> Hồ Sơ
              </button>
              <button type='button' onClick={() => jumpTo('profile')}>
                <Settings size={16} /> Cài Đặt
              </button>
              <button type='button' onClick={toggleTheme}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                {isDark ? 'Chế Độ Sáng' : 'Chế Độ Tối'}
              </button>
              <button type='button' onClick={onLogout}>
                <LogOut size={16} /> Đăng Xuất
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
              <span>Mã Nhân Viên: </span>
              <strong>{employee.employeeId}</strong>
            </div>
            <button type='button' className='logout-link' onClick={onLogout}>
              <LogOut size={16} /> Đăng Xuất
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