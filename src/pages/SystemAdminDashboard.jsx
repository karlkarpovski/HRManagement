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
  { label: 'Tổng Quan', target: 'overview' },
  { label: 'Người Dùng', target: 'users' },
  { label: 'Quyền Hạn', target: 'permissions' },
  { label: 'Hệ Thống', target: 'health' },
  { label: 'Kiểm Tra', target: 'audit' },
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
    { role: 'Quản Trị Viên', permissions: ['Quản lý người dùng', 'Quyền hạn', 'Cài đặt hệ thống', 'Nhật ký kiểm tra'] },
    { role: 'Quản Lý Nhân Sự', permissions: ['CRUD nhân viên', 'CRUD phòng ban', 'Báo cáo', 'Phân tích'] },
    { role: 'Quản Lý Lương', permissions: ['Đợt lương', 'Xét duyệt chấm công', 'Lịch sử lương'] },
    { role: 'Nhân Viên', permissions: ['Xem hồ sơ', 'Yêu cầu nghỉ phép', 'Lương cá nhân'] },
  ];

  const systemHealth = [
    { label: 'Dịch vụ API', value: 'Tốt', icon: Database },
    { label: 'Dịch vụ xác thực', value: 'Tốt', icon: ShieldCheck },
    { label: 'Đồng bộ CSDL', value: 'Đang hoạt động', icon: HardDriveDownload },
    { label: 'Bản ghi hệ thống', value: `${employees.length} nhân viên`, icon: FileClock },
  ];

  const securitySignals = useMemo(() => {
    return alerts.slice(0, 5).map((a) => `${a.type || 'Cảnh báo'}: ${a.message || ''}`);
  }, [alerts]);

  const overviewStats = [
    { label: 'Người dùng được quản lý', value: String(activeUsers), note: 'Tổng số tài khoản nhân viên', tone: 'primary' },
    { label: 'Phòng ban', value: String(deptCount), note: 'Phòng ban đang hoạt động', tone: 'success' },
    { label: 'Cảnh báo đang mở', value: String(alertCount), note: 'Thông báo hệ thống', tone: 'warning' },
    { label: 'Tình trạng hệ thống', value: 'Trực tuyến', note: 'Tất cả dịch vụ đang hoạt động', tone: 'neutral' },
  ];

  const userQueue = useMemo(() => {
    return employees.slice(0, 5).map((emp) => ({
      name: emp.FullName || 'Không xác định',
      username: `nv_${emp.EmployeeID}`,
      role: emp.PositionName || 'Nhân viên',
      status: emp.Status || 'Đang hoạt động',
      action: 'Xem xét',
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
        <div style={{ width: '100%', wordWrap: 'break-word' }}>
          <span className='system-admin-pill'>Quản Trị</span>
          <h1 style={{ wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.3 }}>Quản lý trực tiếp người dùng, quyền hạn và tình trạng hệ thống từ một bảng điều khiển.</h1>
          <p style={{ wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.6 }}>Không gian làm việc này tập trung vào kiểm soát truy cập, giám sát bảo mật và cài đặt vận hành.</p>
        </div>
        <div className='system-admin-hero-actions'>
          <button type='button' className='system-admin-primary-action'>
            <UserRoundPlus size={16} /> Tạo Người Dùng
          </button>
          <button type='button' className='system-admin-secondary-action'>
            <LockKeyhole size={16} /> Xem Xét Chính Sách Truy Cập
          </button>
        </div>
      </section>

      <section className='system-admin-kpi-grid' aria-label='Chỉ số tổng kết quản trị hệ thống'>
        {overviewStats.map((stat) => (
          <article key={stat.label} className={`system-admin-kpi-card ${stat.tone}`} style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{stat.label}</span>
            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{stat.value}</strong>
            <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', margin: 0 }}>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className='system-admin-content-grid'>
        <article className='system-admin-panel' id='users'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>Người Dùng</span>
              <h2>Quản lý người dùng</h2>
            </div>
          </div>
          <div className='system-admin-user-list'>
            {userQueue.map((user) => (
              <div key={user.username} className='system-admin-user-card'>
                <div className='system-admin-user-avatar'><UserCog size={16} /></div>
                <div className='system-admin-user-copy' style={{ minWidth: 0, overflow: 'hidden' }}>
                  <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{user.name}</strong>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{user.username}</span>
                  <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user.role} · {user.status}</p>
                </div>
                <button type='button' className='system-admin-inline-action' style={{ flexShrink: 0 }}>{user.action}</button>
              </div>
            ))}
            {userQueue.length === 0 && <p style={{ padding: 16, color: '#8ba3b8' }}>Không tìm thấy người dùng</p>}
          </div>
        </article>

        <article className='system-admin-panel' id='permissions'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>Quyền Hạn</span>
              <h2>Ma trận quyền hạn theo vai trò</h2>
            </div>
          </div>
          <div className='system-admin-permission-list'>
            {permissionMatrix.map((item) => (
              <div key={item.role} className='system-admin-permission-card'>
                <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 150 }}>{item.role}</strong>
                <div className='system-admin-chip-row' style={{ overflow: 'hidden', flexWrap: 'wrap' }}>
                  {item.permissions.map((permission) => (
                    <span key={permission} className='system-admin-chip' style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180, display: 'inline-block' }}>{permission}</span>
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
              <span className='system-admin-panel-kicker'>Hệ Thống</span>
              <h2>Trạng thái dịch vụ</h2>
            </div>
          </div>
          <div className='system-admin-health-grid'>
            {systemHealth.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className='system-admin-health-card'>
                  <Icon size={16} />
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.label}</span>
                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className='system-admin-panel' id='audit'>
          <div className='system-admin-panel-header'>
            <div>
              <span className='system-admin-panel-kicker'>Bảo Mật</span>
              <h2>Kiểm tra và cảnh báo</h2>
            </div>
          </div>
          <div className='system-admin-alert-stack'>
            {securitySignals.length > 0 ? (
              securitySignals.map((signal, i) => (
                <div key={i} className='system-admin-alert-item'>
                  <CircleAlert size={16} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>{signal}</span>
                </div>
              ))
            ) : (
              <p style={{ padding: 16, color: '#8ba3b8' }}>Không có cảnh báo đang hoạt động</p>
            )}
          </div>
          <div className='system-admin-metrics-row'>
            <div>
              <Activity size={16} />
              <span>Giám sát hệ thống đang hoạt động</span>
            </div>
            <div>
              <BellRing size={16} />
              <span>{alertCount} kênh cảnh báo</span>
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
            <span className='system-admin-brand-mark'>Q</span>
            <div>
              <strong>Quản Trị Hệ Thống</strong>
              <span>Bảng điều khiển toàn quyền</span>
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
            <span>Vai trò</span>
            <strong>Quản Trị Viên</strong>
          </div>
          <button type='button' className='system-admin-theme-toggle' onClick={toggleTheme}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Sáng' : 'Tối'}
          </button>
          {onLogout && (
            <button type='button' className='system-admin-logout' onClick={onLogout}>
              <LogOut size={16} /> Đăng Xuất
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