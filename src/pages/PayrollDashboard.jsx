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
import api from '../api/axios';
import '../styles/payroll-dashboard.css';

const statusTone = {
  Approved: 'is-success',
  Archived: 'is-neutral',
  'Ready for approval': 'is-warning',
};

const sectionNav = [
  { label: 'Overview', target: 'overview' },
  { label: 'Payroll Runs', target: 'runs' },
  { label: 'Attendance', target: 'attendance' },
  { label: 'History', target: 'history' },
];

function formatVND(amount) {
  return (amount || 0).toLocaleString('vi-VN') + '₫';
}

function formatVNDShort(amount) {
  const n = amount || 0;
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'tỷ';
  if (n >= 1000000) return (n / 1000000).toFixed(0) + 'tr';
  return n.toLocaleString('vi-VN') + '₫';
}

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
    { label: 'Tổng lương', value: formatVNDShort(totalPayroll), note: 'Đã xử lý', tone: 'primary' },
    { label: 'Chuyên cần', value: attendanceCompliance, note: `${attendanceData.length} records`, tone: 'success' },
    { label: 'Ngoại lệ', value: String(exceptions), note: 'Cần xem xét', tone: 'warning' },
    { label: 'Lịch sử', value: String(payrollData.length), note: 'Bản ghi lương', tone: 'neutral' },
  ];

  const payrollRuns = useMemo(() => {
    const grouped = {};
    payrollData.forEach((p) => {
      const month = p.SalaryMonth ? String(p.SalaryMonth).slice(0, 7) : 'Unknown';
      if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
      grouped[month].total += parseFloat(p.NetSalary) || 0;
      grouped[month].count += 1;
    });
    return Object.entries(grouped).slice(0, 5).map(([period, data]) => ({
      period,
      status: 'Completed',
      amount: formatVNDShort(data.total),
      count: data.count,
    }));
  }, [payrollData]);

  const attendanceIssues = useMemo(() => {
    // Build lookup: EmployeeID -> FullName
    const nameMap = {};
    employees.forEach((e) => { nameMap[e.EmployeeID] = e.FullName || `Employee #${e.EmployeeID}`; });
    
    return attendanceData
      .filter((a) => (a.AbsentDays || 0) > 0)
      .slice(0, 5)
      .map((a) => ({
        id: a.EmployeeID,
        name: nameMap[a.EmployeeID] || `Employee #${a.EmployeeID}`,
        issue: `Vắng ${a.AbsentDays} ngày`,
      }));
  }, [attendanceData, employees]);

  const payrollHistory = useMemo(() => {
    return payrollData.slice(0, 10).map((p) => ({
      cycle: p.SalaryMonth ? String(p.SalaryMonth).slice(0, 7) : 'N/A',
      net: formatVND(p.NetSalary),
      status: 'Approved',
    }));
  }, [payrollData]);

  const jumpTo = (target) => {
    if (typeof document === 'undefined') return;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const mainContent = (
    <>
      <section className='payroll-hero' id='overview'>
        <div>
          <span className='payroll-pill'>Payroll Operations</span>
          <h1>Run payroll, resolve attendance gaps, and review payroll history in one place.</h1>
          <p>This workspace is focused on payroll execution, attendance validation, and payment records.</p>
        </div>
        <div className='payroll-hero-actions'>
          <button type='button' className='payroll-primary-action'>
            <ShieldCheck size={16} /> Preview payroll
          </button>
          <button type='button' className='payroll-secondary-action'>
            <Download size={16} /> Export history
          </button>
        </div>
      </section>

      <section className='payroll-kpi-grid' aria-label='Payroll summary metrics'>
        {quickStats.map((stat) => (
          <article key={stat.label} className={`payroll-kpi-card ${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className='payroll-content-grid'>
        <article className='payroll-panel payroll-run-panel' id='runs'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Payroll periods</span>
              <h2>Payroll runs</h2>
            </div>
          </div>
          <div className='payroll-run-list'>
            {payrollRuns.length > 0 ? (
              payrollRuns.map((run) => (
                <div key={run.period} className='payroll-run-item'>
                  <div>
                    <strong>{run.period}</strong>
                    <span>{run.status} ({run.count} employees)</span>
                  </div>
                  <div>
                    <strong>{run.amount}</strong>
                    <span>Period</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: 16, color: '#8ba3b8' }}>No payroll data available</p>
            )}
          </div>
          {payrollRuns.length > 0 && (
            <div className='payroll-run-summary'>
              <div><Clock3 size={16} /><span>{payrollRuns.length} payment periods</span></div>
              <div><BadgeCheck size={16} /><span>All processed records</span></div>
            </div>
          )}
        </article>

        <article className='payroll-panel payroll-attendance-panel' id='attendance'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Attendance</span>
              <h2>Exception review</h2>
            </div>
          </div>
          <div className='payroll-alert-list'>
            {attendanceIssues.length > 0 ? (
              attendanceIssues.map((item, i) => (
                  <div key={i} className='payroll-alert-item'>
                    <div className='payroll-alert-icon'><AlertTriangle size={16} /></div>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.issue} <em>Cần xem xét</em></p>
                    </div>
                  </div>
              ))
            ) : (
              <p style={{ padding: 16, color: '#8ba3b8' }}>No attendance exceptions</p>
            )}
          </div>
          <div className='payroll-metric-row'>
            <div><span>Total attendance records</span><strong>{attendanceData.length}</strong></div>
            <div><span>Pending review</span><strong>{exceptions} records</strong></div>
          </div>
        </article>
      </section>

      <section className='payroll-panel payroll-history-panel' id='history'>
        <div className='payroll-panel-header'>
          <div>
            <span className='payroll-panel-kicker'>Archive</span>
            <h2>Payroll history</h2>
          </div>
        </div>
        <div className='payroll-history-table-wrap'>
          <table className='payroll-history-table'>
            <thead>
              <tr>
                <th>Kỳ lương</th>
                <th>Lương thực nhận</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.map((item, i) => (
                <tr key={i}>
                  <td><div className='table-cycle-cell'><ReceiptText size={15} /><span>{item.cycle}</span></div></td>
                  <td>{item.net}</td>
                  <td><span className={`payroll-status ${statusTone[item.status] || 'is-neutral'}`}>{item.status}</span></td>
                </tr>
              ))}
              {payrollHistory.length === 0 && (
                <tr><td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#8ba3b8' }}>No payroll history</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='payroll-footer-grid'>
        <article className='payroll-panel compact'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Workflow</span>
              <h2>Processing checklist</h2>
            </div>
          </div>
          <ul className='payroll-checklist'>
            <li><UsersRound size={16} /> Attendance exceptions reviewed</li>
            <li><CalendarClock size={16} /> Payroll cut-off confirmed</li>
            <li><Wallet size={16} /> Funds release validated</li>
          </ul>
        </article>

        <article className='payroll-panel compact'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Summary</span>
              <h2>Payroll totals</h2>
            </div>
          </div>
          <div className='payroll-export-card'>
            <LayoutGrid size={18} />
            <div>
              <strong>Total processed: {formatVNDShort(totalPayroll)}</strong>
              <span>{payrollData.length} salary records from system.</span>
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
              <strong>Payroll Manager</strong>
              <span>Dedicated workspace</span>
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
          <div><span>Active role</span><strong>Payroll Manager</strong></div>
          <button type='button' className='payroll-theme-toggle' onClick={toggleTheme}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
          {onLogout && (
            <button type='button' className='payroll-logout' onClick={onLogout}>
              <LogOut size={16} /> Sign out
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