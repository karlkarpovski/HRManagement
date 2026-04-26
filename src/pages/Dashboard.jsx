import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../styles/dashboard.css';

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('hrms-theme') === 'dark';
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setDark((current) => {
      const next = !current;
      try {
        localStorage.setItem('hrms-theme', next ? 'dark' : 'light');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const salaryByUnit = MONTHS.map((m, i) => ({
  month: m,
  Engineering: 60 + Math.round(Math.sin(i * 0.5) * 20),
  Marketing: 35 + Math.round(Math.cos(i * 0.6) * 15),
  Design: 45 + Math.round(Math.sin(i * 0.8) * 18),
  Support: 25 + Math.round(Math.cos(i * 0.4) * 10),
  Operations: 55 + Math.round(Math.sin(i * 0.3) * 22),
}));

const headcountByDept = [
  { quarter: 'Q1', Engineering: 42, Marketing: 28, Sales: 35 },
  { quarter: 'Q2', Engineering: 47, Marketing: 31, Sales: 38 },
  { quarter: 'Q3', Engineering: 52, Marketing: 29, Sales: 40 },
  { quarter: 'Q4', Engineering: 55, Marketing: 33, Sales: 44 },
  { quarter: 'Q5', Engineering: 58, Marketing: 35, Sales: 46 },
  { quarter: 'Q6', Engineering: 63, Marketing: 37, Sales: 50 },
];

const salaryPie = [
  { name: 'Engineering', value: 38.2, color: '#2a7a8c' },
  { name: 'Marketing', value: 22.5, color: '#f0c040' },
  { name: 'Sales', value: 19.8, color: '#3cbaba' },
  { name: 'Operations', value: 12.3, color: '#5a8a9f' },
  { name: 'Design', value: 7.2, color: '#8ecfcf' },
];

const positionDist = [
  { name: 'Senior', value: 28, color: '#f0c040' },
  { name: 'Mid-Level', value: 42, color: '#3cbaba' },
  { name: 'Junior', value: 30, color: '#2a7a8c' },
];

const notifications = [
  { id: 1, text: 'Elena Morozova - 3-Year Work Anniversary', sub: 'Tomorrow, Jun 25', done: false },
  { id: 2, text: 'David Kim - Leave Limit Alert (18/20 days used)', sub: 'As of today', done: false },
  { id: 3, text: 'New Employee Onboarding - 3 pending kits', sub: 'John Smith / Hossein / Maryam', done: true },
  { id: 4, text: 'Francisco Vasquez - 5-Year Work Anniversary', sub: 'Jun 30, 2021', done: false },
];

const perfColor = (p) =>
  ({
    Excellent: { bg: '#d1fae5', text: '#065f46' },
    Good: { bg: '#dbeafe', text: '#1e40af' },
    Average: { bg: '#fef3c7', text: '#92400e' },
  }[p] || { bg: '#f3f4f6', text: '#374151' });

const perfColorDark = (p) =>
  ({
    Excellent: { bg: '#064e3b', text: '#6ee7b7' },
    Good: { bg: '#1e3a5f', text: '#93c5fd' },
    Average: { bg: '#78350f', text: '#fde68a' },
  }[p] || { bg: '#374151', text: '#d1d5db' });

function Avatar({ name, size = 32 }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const colors = ['#2a7a8c', '#3cbaba', '#f0c040', '#5a8a9f', '#8ecfcf', '#f08040'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: 'DM Mono, monospace',
      }}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, delta, dark }) {
  return (
    <div
      style={{
        background: dark ? '#1e2a35' : '#fff',
        border: `1px solid ${dark ? '#2d3d4d' : '#e8eef2'}`,
        borderRadius: 12,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: dark ? '0 2px 12px #0005' : '0 2px 12px #0000000d',
        flex: 1,
        minWidth: 180,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          background: dark ? '#243040' : '#f0f8fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          flexShrink: 0,
          fontFamily: 'DM Mono, monospace',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: dark ? '#8ba3b8' : '#8ca0af', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: dark ? '#e8f0f8' : '#1a2a38', lineHeight: 1, fontFamily: 'DM Mono, monospace' }}>
          {value}
        </div>
        {delta && <div style={{ fontSize: 11, color: '#3cbaba', fontWeight: 600, marginTop: 3 }}>{delta}</div>}
      </div>
    </div>
  );
}

function Block({ children, dark, style = {}, title, action }) {
  return (
    <div
      style={{
        background: dark ? '#1e2a35' : '#fff',
        border: `1px solid ${dark ? '#2d3d4d' : '#e8eef2'}`,
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: dark ? '0 2px 16px #0006' : '0 2px 14px #00000009',
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {title && <span style={{ fontSize: 14, fontWeight: 700, color: dark ? '#c8dae8' : '#1a2a38', letterSpacing: '0.01em' }}>{title}</span>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: dark ? '#162030' : '#fff',
        border: `1px solid ${dark ? '#2d3d4d' : '#e0eaf0'}`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 4px 16px #0002',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: dark ? '#c8dae8' : '#1a2a38' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name}: <b>{entry.value}</b>
        </div>
      ))}
    </div>
  );
}

const LINE_COLORS = ['#3cbaba', '#f0c040', '#2a7a8c', '#8ecfcf', '#f08040'];
const BAR_COLORS = ['#2a7a8c', '#3cbaba', '#f0c040'];

function DashboardPage() {
  console.log("🔥 DashboardPage render");
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
  axios.get('http://127.0.0.1:5000/api/employees')
    .then(res => {
      console.log("DATA:", res.data);

      const mapped = res.data.map(e => ({
        id: e.EmployeeID,
        name: e.FullName,
        role: "Employee",
        dept: "Dept " + e.DepartmentID,
        perf: "Good",
        sync: true
      }));

      console.log("MAPPED:", mapped);

      setEmployees(mapped);
    })
    .catch(err => console.log(err));
  }, []);
  const { dark, toggle } = useTheme();
  const [search, setSearch] = useState('');
  const [empModal, setEmpModal] = useState(false);
  const [todos, setTodos] = useState(notifications);
  const [searchFocused, setSearchFocused] = useState(false);

  const text = dark ? '#d4e6f4' : '#1a2a38';
  const muted = dark ? '#7a95aa' : '#8ca0af';
  const border = dark ? '#243040' : '#e0eaf0';
  const accent = '#3cbaba';

  const filtered = employees.filter(
    (e) =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTodo = (id) => setTodos((list) => list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const statsData = [
    { icon: 'EMP', label: 'Total Employees', value: '425', delta: '+4.2% this quarter' },
    { icon: 'NEW', label: 'New This Month', value: '22', delta: '+3 from last month' },
    { icon: 'PAY', label: 'Total Salary (Month)', value: '$2.8M', delta: 'Up 6% vs last month' },
    { icon: 'ALT', label: 'Leave Alerts', value: '7', delta: 'Flagged employees' },
  ];

  return (
    <div className={dark ? 'dashboard-template dashboard-template-dark' : 'dashboard-template'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: dark ? '#162030' : '#fff', borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.01em' }}>HR Dashboard</div>
        <div style={{ fontSize: 12, color: muted, marginRight: 'auto' }}>HRMS / Dashboard</div>

        <div style={{ position: 'relative' }}>
          <input
            placeholder='Search employees...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            style={{
              background: dark ? '#1e2a35' : '#f0f6fa',
              border: `1px solid ${searchFocused ? accent : border}`,
              borderRadius: 8,
              padding: '7px 14px 7px 34px',
              fontSize: 13,
              color: text,
              width: 200,
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: muted, fontSize: 11 }}>FIND</span>
        </div>

        <button
          onClick={toggle}
          title='Toggle theme'
          style={{
            background: dark ? '#243040' : '#eaf7f7',
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: '7px 12px',
            cursor: 'pointer',
            fontSize: 12,
            color: text,
            fontWeight: 700,
          }}
        >
          {dark ? 'LIGHT' : 'DARK'}
        </button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {statsData.map((item) => (
            <StatCard key={item.label} dark={dark} {...item} />
          ))}
        </div>

        <div className='dashboard-grid-2'>
          <Block dark={dark} title='Salary Expenditure by Dept'>
            <ResponsiveContainer width='100%' height={210}>
              <PieChart>
                <Pie data={salaryPie} cx='50%' cy='50%' innerRadius={0} outerRadius={80} dataKey='value' label={({ name, value }) => `${name}: ${value}%`} labelLine={false} fontSize={10}>
                  {salaryPie.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: dark ? '#162030' : '#fff', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Block>

          <Block dark={dark} title='Headcount by Dept & Position (Quarterly)'>
            <ResponsiveContainer width='100%' height={230}>
              <BarChart data={headcountByDept} barSize={22}>
                <CartesianGrid strokeDasharray='3 3' stroke={dark ? '#243040' : '#eaf0f4'} />
                <XAxis dataKey='quarter' tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Engineering', 'Marketing', 'Sales'].map((k, i) => (
                  <Bar key={k} dataKey={k} stackId='a' fill={BAR_COLORS[i]} radius={i === 2 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Block>
        </div>

        <div className='dashboard-grid-3'>
          <Block dark={dark} title='Total Salary by Unit - Historic Trends'>
            <ResponsiveContainer width='100%' height={220}>
              <LineChart data={salaryByUnit}>
                <CartesianGrid strokeDasharray='3 3' stroke={dark ? '#243040' : '#eaf0f4'} />
                <XAxis dataKey='month' tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Engineering', 'Marketing', 'Design', 'Support', 'Operations'].map((k, i) => (
                  <Line key={k} type='monotone' dataKey={k} stroke={LINE_COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Block>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Block dark={dark} title='Notifications & Alerts' style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todos.map((n) => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: n.done ? 0.45 : 1 }}>
                    <button
                      onClick={() => toggleTodo(n.id)}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `2px solid ${n.done ? accent : border}`,
                        background: n.done ? accent : 'transparent',
                        cursor: 'pointer',
                        marginTop: 2,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: text, textDecoration: n.done ? 'line-through' : 'none' }}>{n.text}</div>
                      <div style={{ fontSize: 10.5, color: muted, marginTop: 2 }}>{n.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Block>

            <Block dark={dark} title='Employee Distribution by Position'>
              <ResponsiveContainer width='100%' height={130}>
                <PieChart>
                  <Pie data={positionDist} cx='50%' cy='50%' innerRadius={38} outerRadius={58} dataKey='value' startAngle={90} endAngle={-270}>
                    {positionDist.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: dark ? '#162030' : '#fff', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Block>
          </div>
        </div>

        <Block
          dark={dark}
          title={`Employee List ${filtered.length < employees.length ? `(${filtered.length} results)` : `- ${employees.length} total`}`}
          action={
            <button onClick={() => setEmpModal(true)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View All
            </button>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${border}` }}>
                  {['Avatar', 'Name', 'Designation', 'Department', 'Performance', 'Sync'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const pc = dark ? perfColorDark(e.perf) : perfColor(e.perf);
                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 1 ? (dark ? '#1a2838' : '#f8fbfc') : 'transparent' }}>
                      <td style={{ padding: '10px 12px' }}><Avatar name={e.name} size={30} /></td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: text }}>{e.name}</td>
                      <td style={{ padding: '10px 12px', color: muted }}>{e.role}</td>
                      <td style={{ padding: '10px 12px', color: muted }}>{e.dept}</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ background: pc.bg, color: pc.text, borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{e.perf}</span></td>
                      <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: e.sync ? '#3cbaba' : '#f08040' }}>{e.sync ? 'Synced' : 'Pending'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Block>
      </div>

      {empModal && (
        <div className='dashboard-modal-overlay' onClick={() => setEmpModal(false)}>
          <div className='dashboard-modal-content' style={{ background: dark ? '#162030' : '#fff', borderColor: border }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: text }}>Full Employee List</span>
              <button onClick={() => setEmpModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: muted }}>X</button>
            </div>
            <input
              placeholder='Search by name, role, or department...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: dark ? '#1e2a35' : '#f0f6fa', border: `1px solid ${border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, color: text, marginBottom: 16, boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardPage />
    </ThemeProvider>
  );
}
