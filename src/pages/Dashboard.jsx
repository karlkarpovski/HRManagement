import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Moon, Sun } from 'lucide-react';
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
import { useTheme } from '../contexts/ThemeContext';
import { useEmployeesRealtime } from '../data/employeesRealtimeStore';
import '../styles/dashboard.css';

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

const defaultNotifications = [
  { id: 'base-1', text: 'Elena Morozova - 3-Year Work Anniversary', sub: 'Tomorrow, Jun 25', done: false },
  { id: 'base-2', text: 'David Kim - Leave Limit Alert (18/20 days used)', sub: 'As of today', done: false },
  { id: 'base-3', text: 'New Employee Onboarding - 3 pending kits', sub: 'John Smith / Hossein / Maryam', done: true },
  { id: 'base-4', text: 'Francisco Vasquez - 5-Year Work Anniversary', sub: 'Jun 30, 2021', done: false },
];

const parseBirthday = (rawDate) => {
  if (!rawDate) {
    return null;
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const isBirthdayToday = (rawDate) => {
  const birthday = parseBirthday(rawDate);
  if (!birthday) {
    return false;
  }

  const today = new Date();
  return birthday.getDate() === today.getDate() && birthday.getMonth() === today.getMonth();
};

const formatBirthdayDate = (rawDate) => {
  const birthday = parseBirthday(rawDate);
  if (!birthday) {
    return 'Today';
  }

  return birthday.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const buildBirthdayMessage = (name, rawDate) => {
  const birthday = parseBirthday(rawDate);
  if (!birthday) {
    return `Wishing ${name} a wonderful birthday.`;
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  const birthdayThisYear = thisYearBirthday < todayMidnight ? new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate()) : thisYearBirthday;
  const oneDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((birthdayThisYear - todayMidnight) / oneDay);
  const age = birthdayThisYear.getFullYear() - birthday.getFullYear();

  if (daysUntil === 0) {
    return `Happy Birthday, ${name}! Turning ${age} today.`;
  }

  return `Birthday on ${birthdayThisYear.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`;
};

const getUpcomingBirthdayDetails = (rawDate) => {
  const birthday = parseBirthday(rawDate);
  if (!birthday) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());

  if (nextBirthday < today) {
    nextBirthday = new Date(now.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
  }

  const oneDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((nextBirthday - today) / oneDay);

  return {
    daysUntil,
    label: nextBirthday.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
  };
};

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

const mapStoreEmployeeToDashboard = (employee) => ({
  id: employee.id,
  name: employee.name,
  role: employee.position || 'Employee',
  dept: employee.department || 'General',
  birthday: employee.dob || null,
  perf: 'Good',
  sync: true,
});

const mapEmployee = (employee) => ({
  id: employee.EmployeeID,
  name: employee.FullName,
  department: `Dept ${employee.DepartmentID}`,
  position: employee.PositionName || `Position ${employee.PositionID || ''}`.trim(),
  dob: employee.DateOfBirth || employee.BirthDate || employee.DOB || null,
  status: employee.Status || 'Active',
  salary: Number(employee.Salary || 0),
});

function DashboardPage() {
  console.log("🔥 DashboardPage render");
  const [sharedEmployees, setSharedEmployees] = useEmployeesRealtime();
  const employees = useMemo(() => sharedEmployees.map(mapStoreEmployeeToDashboard), [sharedEmployees]);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    axios
      .get('http://127.0.0.1:5000/api/employees')
      .then((res) => {
        console.log('DATA:', res.data);

        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(mapEmployee);
          console.log('MAPPED:', mapped);
          setSharedEmployees(mapped);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [setSharedEmployees]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [empModal, setEmpModal] = useState(false);
  const [todos, setTodos] = useState(defaultNotifications);
  const [searchFocused, setSearchFocused] = useState(false);

  const text = isDark ? '#d4e6f4' : '#1a2a38';
  const muted = isDark ? '#7a95aa' : '#8ca0af';
  const border = isDark ? '#243040' : '#e0eaf0';
  const accent = '#3cbaba';
  const nowDisplay = now.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const filtered = employees.filter(
    (e) =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase())
  );

  const birthdayNotifications = useMemo(
    () =>
      employees
        .filter((employee) => isBirthdayToday(employee.birthday))
        .map((employee) => ({
          id: `birthday-${employee.id}`,
          text: `${employee.name} - Birthday Today`,
          sub: buildBirthdayMessage(employee.name, employee.birthday),
          done: false,
        })),
    [employees]
  );

  const upcomingBirthdays = useMemo(
    () =>
      employees
        .map((employee) => {
          const birthdayInfo = getUpcomingBirthdayDetails(employee.birthday);
          if (!birthdayInfo) {
            return null;
          }

          return {
            id: employee.id,
            name: employee.name,
            dept: employee.dept,
            ...birthdayInfo,
          };
        })
        .filter(Boolean)
        .filter((item) => item.daysUntil <= 7)
        .sort((a, b) => a.daysUntil - b.daysUntil),
    [employees]
  );

  const notificationFeed = useMemo(
    () => [...birthdayNotifications, ...defaultNotifications],
    [birthdayNotifications]
  );

  useEffect(() => {
    setTodos((current) => {
      const doneMap = new Map(current.map((item) => [item.id, item.done]));
      return notificationFeed.map((item) => ({
        ...item,
        done: doneMap.get(item.id) ?? item.done,
      }));
    });
  }, [notificationFeed]);

  const toggleTodo = (id) => setTodos((list) => list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const statsData = [
    { icon: 'EMP', label: 'Total Employees', value: '425', delta: '+4.2% this quarter' },
    { icon: 'NEW', label: 'New This Month', value: '22', delta: '+3 from last month' },
    { icon: 'PAY', label: 'Total Salary (Month)', value: '$2.8M', delta: 'Up 6% vs last month' },
    { icon: 'ALT', label: 'Leave Alerts', value: '7', delta: 'Flagged employees' },
  ];

  return (
    <div className={isDark ? 'dashboard-template dashboard-template-dark' : 'dashboard-template'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: isDark ? '#162030' : '#fff', borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.01em' }}>HR Dashboard</div>
        <div style={{ fontSize: 12, color: muted, marginRight: 'auto' }}>HRMS / Dashboard</div>
        <div style={{ fontSize: 12, color: muted, fontWeight: 600 }}>{nowDisplay}</div>

        <div style={{ position: 'relative' }}>
          <input
            placeholder='Search employees...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            style={{
              background: isDark ? '#1e2a35' : '#f0f6fa',
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
          onClick={toggleTheme}
          title='Toggle theme'
          style={{
            background: isDark ? '#243040' : '#eaf7f7',
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: '7px 12px',
            cursor: 'pointer',
            fontSize: 12,
            color: text,
            fontWeight: 700,
          }}
        >
          {isDark ? 'LIGHT' : 'DARK'}
        </button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {statsData.map((item) => (
            <StatCard key={item.label} dark={isDark} {...item} />
          ))}
        </div>

        <div className='dashboard-grid-2'>
          <Block dark={isDark} title='Salary Expenditure by Dept'>
            <ResponsiveContainer width='100%' height={210}>
              <PieChart>
                <Pie data={salaryPie} cx='50%' cy='50%' innerRadius={0} outerRadius={80} dataKey='value' label={({ name, value }) => `${name}: ${value}%`} labelLine={false} fontSize={10}>
                  {salaryPie.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: isDark ? '#162030' : '#fff', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Block>

          <Block dark={isDark} title='Headcount by Dept & Position (Quarterly)'>
            <ResponsiveContainer width='100%' height={230}>
              <BarChart data={headcountByDept} barSize={22}>
                <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#243040' : '#eaf0f4'} />
                <XAxis dataKey='quarter' tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={isDark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Engineering', 'Marketing', 'Sales'].map((k, i) => (
                  <Bar key={k} dataKey={k} stackId='a' fill={BAR_COLORS[i]} radius={i === 2 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Block>
        </div>

        <div className='dashboard-grid-3'>
          <Block dark={isDark} title='Total Salary by Unit - Historic Trends'>
            <ResponsiveContainer width='100%' height={220}>
              <LineChart data={salaryByUnit}>
                <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#243040' : '#eaf0f4'} />
                <XAxis dataKey='month' tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={isDark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Engineering', 'Marketing', 'Design', 'Support', 'Operations'].map((k, i) => (
                  <Line key={k} type='monotone' dataKey={k} stroke={LINE_COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Block>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Block dark={isDark} title='Notifications & Alerts' style={{ flex: 1 }}>
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

            <Block dark={isDark} title='Upcoming Birthdays (Next 7 Days)'>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingBirthdays.length > 0 ? (
                  upcomingBirthdays.map((employee) => (
                    <div
                      key={employee.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `1px solid ${border}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                        background: isDark ? '#1a2838' : '#f8fbfc',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: text }}>{employee.name}</div>
                        <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{employee.dept}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#3cbaba' }}>
                          {employee.daysUntil === 0 ? 'Today' : `In ${employee.daysUntil} day${employee.daysUntil > 1 ? 's' : ''}`}
                        </div>
                        <div style={{ fontSize: 10.5, color: muted, marginTop: 2 }}>{buildBirthdayMessage(employee.name, employee.birthday)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: muted }}>No upcoming birthdays in the next 7 days.</div>
                )}
              </div>
            </Block>

            <Block dark={isDark} title='Employee Distribution by Position'>
              <ResponsiveContainer width='100%' height={240}>
                <PieChart>
                  <Pie data={positionDist} cx='50%' cy='50%' innerRadius={0} outerRadius={80} dataKey='value' label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {positionDist.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: isDark ? '#162030' : '#fff', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Block>
          </div>
        </div>

        <Block
          dark={isDark}
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
                  const pc = isDark ? perfColorDark(e.perf) : perfColor(e.perf);
                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 1 ? (isDark ? '#1a2838' : '#f8fbfc') : 'transparent' }}>
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
          <div className='dashboard-modal-content' style={{ background: isDark ? '#162030' : '#fff', borderColor: border }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: text }}>Full Employee List</span>
              <button onClick={() => setEmpModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: muted }}>X</button>
            </div>
            <input
              placeholder='Search by name, role, or department...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: isDark ? '#1e2a35' : '#f0f6fa', border: `1px solid ${border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, color: text, marginBottom: 16, boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return <DashboardPage />;
}
