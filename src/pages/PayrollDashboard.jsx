import { useMemo, useState } from 'react';
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
import '../styles/payroll-dashboard.css';

const quickStats = [
  { label: 'Gross payroll', value: '$284,910', note: 'Current processing cycle', tone: 'primary' },
  { label: 'Attendance compliance', value: '97.4%', note: 'Last 30 days', tone: 'success' },
  { label: 'Payroll exceptions', value: '6', note: 'Requires review before release', tone: 'warning' },
  { label: 'History records', value: '128', note: 'Accessible payroll archive', tone: 'neutral' },
];

const payrollRuns = [
  { period: 'Apr 2026', status: 'Ready for approval', amount: '$284,910', due: '30 Apr 2026' },
  { period: 'Mar 2026', status: 'Completed', amount: '$279,430', due: '31 Mar 2026' },
  { period: 'Feb 2026', status: 'Completed', amount: '$276,820', due: '28 Feb 2026' },
];

const attendanceIssues = [
  { name: 'Amina Rahman', department: 'Product Design', issue: 'Missing check-out', impact: '2h pending' },
  { name: 'Owen Patel', department: 'Finance', issue: 'Late check-in', impact: '1 occurrence' },
  { name: 'Leila Hassan', department: 'Operations', issue: 'Timesheet mismatch', impact: 'Needs verification' },
];

const payrollHistory = [
  { cycle: 'Apr 2026', processed: '30 Apr 2026', net: '$261,820', adjustments: '+18', status: 'Approved' },
  { cycle: 'Mar 2026', processed: '31 Mar 2026', net: '$258,410', adjustments: '+12', status: 'Approved' },
  { cycle: 'Feb 2026', processed: '28 Feb 2026', net: '$255,790', adjustments: '+9', status: 'Archived' },
  { cycle: 'Jan 2026', processed: '31 Jan 2026', net: '$252,360', adjustments: '+15', status: 'Archived' },
];

const sectionNav = [
  { label: 'Overview', target: 'overview' },
  { label: 'Payroll Runs', target: 'runs' },
  { label: 'Attendance', target: 'attendance' },
  { label: 'History', target: 'history' },
];

const statusTone = {
  Approved: 'is-success',
  Archived: 'is-neutral',
  'Ready for approval': 'is-warning',
};

export default function PayrollDashboard({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navItems = useMemo(() => sectionNav, []);

  const jumpTo = (target) => {
    if (typeof document === 'undefined') {
      return;
    }

    const element = document.getElementById(target);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

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

          <button type='button' className='payroll-menu-toggle' onClick={() => setMenuOpen((current) => !current)}>
            <Menu size={18} />
            Menu
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
          <div>
            <span>Active role</span>
            <strong>Payroll Manager</strong>
          </div>
          <button type='button' className='payroll-theme-toggle' onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
          {onLogout && (
            <button type='button' className='payroll-logout' onClick={onLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      <main className='payroll-main'>
        <section className='payroll-hero' id='overview'>
          <div>
            <span className='payroll-pill'>Payroll Operations</span>
            <h1>Run payroll, resolve attendance gaps, and review payroll history in one place.</h1>
            <p>
              This workspace is isolated from the HR Manager dashboard and focuses only on payroll execution,
              attendance validation, and payment records.
            </p>
          </div>

          <div className='payroll-hero-actions'>
            <button type='button' className='payroll-primary-action'>
              <ShieldCheck size={16} />
              Preview payroll
            </button>
            <button type='button' className='payroll-secondary-action'>
              <Download size={16} />
              Export history
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
                <span className='payroll-panel-kicker'>Current cycle</span>
                <h2>Payroll runs</h2>
              </div>
              <button type='button' className='panel-link'>
                View processing queue
              </button>
            </div>

            <div className='payroll-run-list'>
              {payrollRuns.map((run) => (
                <div key={run.period} className='payroll-run-item'>
                  <div>
                    <strong>{run.period}</strong>
                    <span>{run.status}</span>
                  </div>
                  <div>
                    <strong>{run.amount}</strong>
                    <span>Due {run.due}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='payroll-run-summary'>
              <div>
                <Clock3 size={16} />
                <span>Release window opens 29 Apr at 09:00</span>
              </div>
              <div>
                <BadgeCheck size={16} />
                <span>3 approvals already completed</span>
              </div>
            </div>
          </article>

          <article className='payroll-panel payroll-attendance-panel' id='attendance'>
            <div className='payroll-panel-header'>
              <div>
                <span className='payroll-panel-kicker'>Attendance</span>
                <h2>Exception review</h2>
              </div>
              <button type='button' className='panel-link'>
                Sync timesheets
              </button>
            </div>

            <div className='payroll-alert-list'>
              {attendanceIssues.map((item) => (
                <div key={item.name} className='payroll-alert-item'>
                  <div className='payroll-alert-icon'>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.department}</span>
                    <p>
                      {item.issue} <em>{item.impact}</em>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='payroll-metric-row'>
              <div>
                <span>Verified attendance</span>
                <strong>94 of 97</strong>
              </div>
              <div>
                <span>Pending review</span>
                <strong>3 records</strong>
              </div>
            </div>
          </article>
        </section>

        <section className='payroll-panel payroll-history-panel' id='history'>
          <div className='payroll-panel-header'>
            <div>
              <span className='payroll-panel-kicker'>Archive</span>
              <h2>Payroll history</h2>
            </div>
            <button type='button' className='panel-link'>
              Open full ledger
            </button>
          </div>

          <div className='payroll-history-table-wrap'>
            <table className='payroll-history-table'>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Processed</th>
                  <th>Net payroll</th>
                  <th>Adjustments</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollHistory.map((item) => (
                  <tr key={item.cycle}>
                    <td>
                      <div className='table-cycle-cell'>
                        <ReceiptText size={15} />
                        <span>{item.cycle}</span>
                      </div>
                    </td>
                    <td>{item.processed}</td>
                    <td>{item.net}</td>
                    <td>{item.adjustments}</td>
                    <td>
                      <span className={`payroll-status ${statusTone[item.status] || 'is-neutral'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
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
              <li>
                <UsersRound size={16} /> Attendance exceptions reviewed
              </li>
              <li>
                <CalendarClock size={16} /> Payroll cut-off confirmed
              </li>
              <li>
                <Wallet size={16} /> Funds release validated
              </li>
            </ul>
          </article>

          <article className='payroll-panel compact'>
            <div className='payroll-panel-header'>
              <div>
                <span className='payroll-panel-kicker'>Recent export</span>
                <h2>Distribution report</h2>
              </div>
            </div>

            <div className='payroll-export-card'>
              <LayoutGrid size={18} />
              <div>
                <strong>Apr 2026 payroll export</strong>
                <span>CSV, PDF, and audit log bundles are ready for download.</span>
              </div>
              <FileClock size={18} />
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}