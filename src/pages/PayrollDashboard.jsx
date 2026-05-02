import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  Clock3,
  Download,
  FileClock,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Wallet,
  UsersRound,
  ReceiptText,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatVND, formatVNDShort } from '../utils/currency';
import api from '../api/axios';
import '../styles/payroll-dashboard.css';

const statusTone = {
  Approved: 'is-success',
  Archived: 'is-neutral',
  'Ready for approval': 'is-warning',
};

const sectionNav = [
  { label: 'Tổng Quan', target: 'overview' },
  { label: 'Đợt Lương', target: 'runs' },
  { label: 'Chấm Công', target: 'attendance' },
  { label: 'Lịch Sử', target: 'history' },
];

export default function PayrollDashboard({ onLogout, embedded }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navItems = useMemo(() => sectionNav, []);

  const [payrollData, setPayrollData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, attRes, empRes] = await Promise.all([
          api.get('/payroll'),
          api.get('/attendance'),
          api.get('/employees'),
        ]);
        setPayrollData(Array.isArray(payRes.data) ? payRes.data : []);
        setAttendanceData(Array.isArray(attRes.data) ? attRes.data : []);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      } catch (err) {
        console.error('Payroll fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPayroll = useMemo(
    () => payrollData.reduce((s, p) => s + (parseFloat(p.NetSalary) || 0), 0),
    [payrollData]
  );

  const attendanceCompliance = useMemo(() => {
    const total = attendanceData.length;
    if (total === 0) return 'N/A';
    const present = attendanceData.filter((a) => !a.AbsentDays || a.AbsentDays === 0).length;
    return `${((present / total) * 100).toFixed(1)}%`;
  }, [attendanceData]);

  const exceptions = attendanceData.filter((a) => (a.AbsentDays || 0) > 0).length;

  const quickStats = [
    { label: 'Tổng Lương', value: formatVNDShort(totalPayroll), note: 'Đã xử lý', tone: 'primary' },
    { label: 'Chuyên Cần', value: attendanceCompliance, note: `${attendanceData.length} bản ghi`, tone: 'success' },
    { label: 'Ngoại Lệ', value: String(exceptions), note: 'Cần xem xét', tone: 'warning' },
    { label: 'Lịch Sử', value: String(payrollData.length), note: 'Bản ghi lương', tone: 'neutral' },
  ];

  const payrollRuns = useMemo(() => {
    const grouped = {};
    payrollData.forEach((p) => {
      const month = p.SalaryMonth ? String(p.SalaryMonth).slice(0, 7) : 'Không xác định';
      if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
      grouped[month].total += parseFloat(p.NetSalary) || 0;
      grouped[month].count += 1;
    });
    return Object.entries(grouped).slice(0, 5).map(([period, data]) => ({
      period,
      status: 'Hoàn Thành',
      amount: formatVNDShort(data.total),
      count: data.count,
    }));
  }, [payrollData]);

  const attendanceIssues = useMemo(() => {
    // Build lookup: EmployeeID -> FullName
    const nameMap = {};
    employees.forEach((e) => { nameMap[e.EmployeeID] = e.FullName || `Nhân viên #${e.EmployeeID}`; });
    
    return attendanceData
      .filter((a) => (a.AbsentDays || 0) > 0)
      .slice(0, 5)
      .map((a) => ({
        id: a.EmployeeID,
        name: nameMap[a.EmployeeID] || `Nhân viên #${a.EmployeeID}`,
        issue: `Vắng ${a.AbsentDays} ngày`,
      }));
  }, [attendanceData, employees]);

  const payrollHistory = useMemo(() => {
    // Build employee lookup map
    const empMap = {};
    employees.forEach((e) => {
      empMap[e.EmployeeID] = {
        name: e.FullName || `Nhân viên #${e.EmployeeID}`,
        designation: e.PositionName || 'N/A',
      };
    });
    
    return payrollData.slice(0, 10).map((p) => {
      const emp = empMap[p.EmployeeID] || { name: 'Không xác định', designation: 'N/A' };
      return {
        cycle: p.SalaryMonth ? String(p.SalaryMonth).slice(0, 7) : 'N/A',
        name: emp.name,
        designation: emp.designation,
        net: formatVND(p.NetSalary),
        status: 'Đã Duyệt',
      };
    });
  }, [payrollData, employees]);

  const jumpTo = (target) => {
    if (typeof document === 'undefined') return;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const mainContent = (
    <>
      <section className='payroll-hero' id='overview'>
        <div>
          <span className='payroll-pill'>Quản Lý Lương</span>
          <h1 style={{ wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.3, display: 'block', width: '100%' }}>Chạy bảng lương, giải quyết các vấn đề chấm công và xem lịch sử lương tại một nơi.</h1>
          <p style={{ wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.6 }}>Không gian làm việc này tập trung vào thực thi lương, xác thực chấm công và các bản ghi thanh toán.</p>
        </div>
        <div className='payroll-hero-actions'>
          <button type='button' className='payroll-primary-action'>
            <ShieldCheck size={16} /> Xem Trước Bảng Lương
          </button>
          <button type='button' className='payroll-secondary-action'>
            <Download size={16} /> Xuất Lịch Sử
          </button>
        </div>
      </section>

      <section className='payroll-kpi-grid' aria-label='Chỉ số tổng kết lương'>
        {quickStats.map((stat) => (
          <article key={stat.label} className={`payroll-kpi-card ${stat.tone}`} style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{stat.label}</span>
            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{stat.value}</strong>
            <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', margin: 0 }}>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className='payroll-content-grid'>
        <article className='payroll-panel payroll-run-panel' id='runs'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Kỳ Lương</span>
              <h2>Đợt Lương</h2>
            </div>
          </div>
          <div className='payroll-run-list'>
            {payrollRuns.length > 0 ? (
              payrollRuns.map((run) => (
                <div key={run.period} className='payroll-run-item'>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>{run.period}</strong>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>{run.status} ({run.count} nhân viên)</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>{run.amount}</strong>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>Kỳ</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: 16, color: '#8ba3b8' }}>Không có dữ liệu lương</p>
            )}
          </div>
          {payrollRuns.length > 0 && (
            <div className='payroll-run-summary'>
              <div><Clock3 size={16} /><span>{payrollRuns.length} kỳ thanh toán</span></div>
              <div><BadgeCheck size={16} /><span>Tất cả bản ghi đã xử lý</span></div>
            </div>
          )}
        </article>

        <article className='payroll-panel payroll-attendance-panel' id='attendance'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Chấm Công</span>
              <h2>Xem Xét Ngoại Lệ</h2>
            </div>
          </div>
          <div className='payroll-alert-list'>
            {attendanceIssues.length > 0 ? (
              attendanceIssues.map((item, i) => (
                  <div key={i} className='payroll-alert-item'>
                    <div className='payroll-alert-icon'><AlertTriangle size={16} /></div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>{item.name}</strong>
                      <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.issue} <em>Cần xem xét</em></p>
                    </div>
                  </div>
              ))
            ) : (
              <p style={{ padding: 16, color: '#8ba3b8' }}>Không có ngoại lệ chấm công</p>
            )}
          </div>
          <div className='payroll-metric-row'>
            <div><span>Tổng số bản ghi chấm công</span><strong>{attendanceData.length}</strong></div>
            <div><span>Đang chờ xem xét</span><strong>{exceptions} bản ghi</strong></div>
          </div>
        </article>
      </section>

      <section className='payroll-panel payroll-history-panel' id='history'>
        <div className='payroll-panel-header'>
          <div>
            <span className='payroll-panel-kicker'>Lưu Trữ</span>
            <h2>Lịch Sử Lương</h2>
          </div>
        </div>
        <div className='payroll-history-table-wrap'>
          <table className='payroll-history-table'>
            <thead>
              <tr>
                <th>Kỳ Lương</th>
                <th>Tên Người Nhận Lương</th>
                <th>Chức Danh</th>
                <th>Lương Thực Nhận</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.map((item, i) => (
                <tr key={i}>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><div className='table-cycle-cell' style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}><ReceiptText size={15} /><span>{item.cycle}</span></div></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.designation}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.net}</td>
                  <td><span className={`payroll-status ${statusTone[item.status] || 'is-neutral'}`}>{item.status}</span></td>
                </tr>
              ))}
              {payrollHistory.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#8ba3b8' }}>Không có lịch sử lương</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='payroll-footer-grid'>
        <article className='payroll-panel compact'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Quy Trình</span>
              <h2>Danh Sách Kiểm Tra Xử Lý</h2>
            </div>
          </div>
          <ul className='payroll-checklist'>
            <li><UsersRound size={16} /> Đã xem xét ngoại lệ chấm công</li>
            <li><CalendarClock size={16} /> Đã xác nhận kỳ chốt lương</li>
            <li><Wallet size={16} /> Đã xác nhận giải ngân</li>
          </ul>
        </article>

        <article className='payroll-panel compact'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Tổng Kết</span>
              <h2>Tổng Lương</h2>
            </div>
          </div>
          <div className='payroll-export-card'>
            <LayoutGrid size={18} />
            <div>
              <strong>Tổng số đã xử lý: {formatVNDShort(totalPayroll)}</strong>
              <span>{payrollData.length} bản ghi lương từ hệ thống.</span>
            </div>
            <FileClock size={18} />
          </div>
        </article>
      </section>
    </>
  );

  if (embedded) {
    // Embedded mode: no rail, main sidebar provides navigation
    return (
      <div className='payroll-embedded'>
        <main className='payroll-main' style={{ padding: 0 }}>
          {mainContent}
        </main>
      </div>
    );
  }

  // Standalone mode with rail (Payroll Manager)
  return (
    <div className='payroll-dashboard-shell'>
      <aside className={`payroll-rail ${menuOpen ? 'open' : ''}`}>
        <div className='payroll-rail-top'>
          <div className='payroll-brand'>
            <span className='payroll-brand-mark'>P</span>
            <div>
              <strong>Quản Lý Lương</strong>
              <span>Không gian làm việc chuyên dụng</span>
            </div>
          </div>
          <button type='button' className='payroll-menu-toggle' onClick={() => setMenuOpen((c) => !c)}>
            <Menu size={18} /> Menu
          </button>
        </div>
        <nav className='payroll-nav'>
          {navItems.map((item) => (
            <button key={item.target} type='button' className='payroll-nav-item' onClick={() => jumpTo(item.target)}>
              <span>{item.label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </nav>
        <div className='payroll-rail-footer'>
          <div><span>Vai trò hiện tại</span><strong>Quản Lý Lương</strong></div>
          <button type='button' className='payroll-theme-toggle' onClick={toggleTheme}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Sáng' : 'Tối'}
          </button>
          {onLogout && (
            <button type='button' className='payroll-logout' onClick={onLogout}>
              <LogOut size={16} /> Đăng Xuất
            </button>
          )}
        </div>
      </aside>
      <main className='payroll-main'>
        {mainContent}
      </main>
    </div>
  );
}