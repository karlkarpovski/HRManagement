import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
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
import api from '../api/axios';
import { formatVND } from '../utils/currency';
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

const MONTHS = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

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
        overflow: 'hidden',
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
      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 11, color: dark ? '#8ba3b8' : '#8ca0af', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: dark ? '#e8f0f8' : '#1a2a38', lineHeight: 1, fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </div>
        {delta && <div style={{ fontSize: 11, color: '#3cbaba', fontWeight: 600, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{delta}</div>}
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
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [hrReport, setHrReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const [now, setNow] = useState(new Date());
  const { dark, toggle } = useTheme();
  const [search, setSearch] = useState('');
  const [empModal, setEmpModal] = useState(false);
  const [todos, setTodos] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [empRes, deptRes, posRes, alertRes, payrollRes, hrRes] = await Promise.all([
          api.get('/employees'),
          api.get('/departments'),
          api.get('/positions'),
          api.get('/alerts'),
          api.get('/payroll'),
          api.get('/reports/hr'),
        ]);

        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setPositions(Array.isArray(posRes.data) ? posRes.data : []);
        setAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
        setPayrollData(Array.isArray(payrollRes.data) ? payrollRes.data : []);
        setHrReport(Array.isArray(hrRes.data) ? hrRes.data : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build lookup maps
  const deptMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => { map[d.DepartmentID] = d.DepartmentName; });
    return map;
  }, [departments]);

  const posMap = useMemo(() => {
    const map = {};
    positions.forEach((p) => { map[p.PositionID] = p.PositionName; });
    return map;
  }, [positions]);

  // Build employee list with resolved names
  const enrichedEmployees = useMemo(() => {
    return employees.map((emp) => ({
      id: emp.EmployeeID,
      name: emp.FullName || 'Không xác định',
      role: posMap[emp.PositionID] || 'Nhân viên',
      dept: deptMap[emp.DepartmentID] || 'Tổng quát',
      status: emp.Status || 'Đang hoạt động',
    }));
  }, [employees, deptMap, posMap]);

  // Real stats
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => !e.Status || e.Status === 'Active').length;
  const totalSalary = payrollData.reduce((sum, p) => sum + (parseFloat(p.NetSalary) || 0), 0);
  const alertCount = alerts.length;

  const statsData = [
    { icon: 'NV', label: 'Tổng nhân viên', value: String(totalEmployees), delta: `${activeCount} đang hoạt động` },
    { icon: 'PB', label: 'Phòng ban', value: String(departments.length), delta: `${positions.length} chức danh` },
    { icon: 'TL', label: 'Tổng quỹ lương', value: formatVND(totalSalary), delta: `${payrollData.length} bản ghi` },
    { icon: 'CB', label: 'Cảnh báo', value: String(alertCount), delta: 'Thông báo hệ thống' },
  ];

  // Alert notifications
  const alertNotifications = useMemo(() => {
    return alerts.slice(0, 8).map((a, i) => ({
      id: `alert-${i}`,
      text: a.message || a.type || `Cảnh báo #${i + 1}`,
      sub: a.type || 'Thông báo',
      done: false,
    }));
  }, [alerts]);

  // Salary distribution by dept for pie chart
  const salaryByDeptPie = useMemo(() => {
    const deptSalaries = {};
    employees.forEach((emp) => {
      const deptName = deptMap[emp.DepartmentID] || 'Khác';
      const empPayroll = payrollData.filter((p) => p.EmployeeID === emp.EmployeeID);
      const total = empPayroll.reduce((sum, p) => sum + (parseFloat(p.NetSalary) || 0), 0);
      deptSalaries[deptName] = (deptSalaries[deptName] || 0) + total;
    });
    const total = Object.values(deptSalaries).reduce((s, v) => s + v, 0) || 1;
    const colors = ['#2a7a8c', '#f0c040', '#3cbaba', '#5a8a9f', '#8ecfcf', '#f08040'];
    return Object.entries(deptSalaries).map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 1000) / 10,
      color: colors[i % colors.length],
    }));
  }, [employees, deptMap, payrollData]);

  // Headcount by dept (from HR report)
  const headcountByDept = useMemo(() => {
    return hrReport.map((r, i) => ({
      quarter: `Q${(i % 4) + 1}`,
      name: r.DepartmentName || 'Không xác định',
      count: r.TotalEmployees || 0,
    }));
  }, [hrReport]);

  const filtered = enrichedEmployees.filter(
    (e) =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase())
  );

  const text = dark ? '#d4e6f4' : '#1a2a38';
  const muted = dark ? '#7a95aa' : '#8ca0af';
  const border = dark ? '#243040' : '#e0eaf0';
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
  
  // Position distribution pie
  const positionDist = useMemo(() => {
    const count = {};
    employees.forEach((emp) => {
      const posName = posMap[emp.PositionID] || 'Không xác định';
      count[posName] = (count[posName] || 0) + 1;
    });
    const total = employees.length || 1;
    const colors = ['#f0c040', '#3cbaba', '#2a7a8c', '#8ecfcf', '#f08040', '#5a8a9f'];
    return Object.entries(count).map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[i % colors.length],
    }));
  }, [employees, posMap]);

  // Monthly salary trends from payroll data
  const salaryByUnit = useMemo(() => {
    const monthlyData = {};
    
    payrollData.forEach((salary) => {
      const monthStr = new Date(salary.SalaryMonth).toLocaleString('en', { month: 'short' });
      const emp = employees.find(e => e.EmployeeID === salary.EmployeeID);
      const deptName = emp ? (deptMap[emp.DepartmentID] || 'Không xác định') : 'Không xác định';
      
      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = {};
      }
      if (!monthlyData[monthStr][deptName]) {
        monthlyData[monthStr][deptName] = 0;
      }
      monthlyData[monthStr][deptName] += parseFloat(salary.NetSalary) || 0;
    });
    
    return MONTHS.map((month) => {
      const item = { month };
      departments.forEach((dept) => {
        item[dept.DepartmentName || 'Không xác định'] = monthlyData[month]?.[dept.DepartmentName] || 0;
      });
      return item;
    }).filter((item, index, arr) => {
      return arr.some(other => 
        MONTHS.indexOf(other.month) >= MONTHS.indexOf(item.month) && 
        departments.some(dept => item[dept.DepartmentName] > 0)
      ) || index === 0;
    });
  }, [payrollData, employees, departments, deptMap]);

  const toggleTodo = (id) => setTodos((list) => list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  // Custom tick renderer for XAxis with text wrapping
  const renderCustomXAxisTick = (tickProps) => {
    const { x, y, payload } = tickProps;
    const maxCharsPerLine = 10;
    const text = payload.value || '';
    
    const wrapText = (text, maxLen) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      words.forEach((word) => {
        if ((currentLine + ' ' + word).trim().length <= maxLen) {
          currentLine = (currentLine + ' ' + word).trim();
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      return lines;
    };
    
    const lines = wrapText(text, maxCharsPerLine);
    
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={index * 12}
            textAnchor="middle"
            fill={muted}
            fontSize={10}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  return (
    <div className={dark ? 'dashboard-template dashboard-template-dark' : 'dashboard-template'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: dark ? '#162030' : '#fff', borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.01em' }}>Bảng Điều Khiển HR</div>
        <div style={{ fontSize: 12, color: muted, marginRight: 'auto' }}>HRMS / Bảng Điều Khiển</div>
        <div style={{ fontSize: 12, color: muted, fontWeight: 600 }}>{nowDisplay}</div>

        <div style={{ position: 'relative' }}>
          <input
            placeholder='Tìm kiếm nhân viên...'
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
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: muted, fontSize: 11 }}>TÌM</span>
        </div>

        <button
          onClick={toggle}
          title='Chuyển đổi giao diện'
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
          {dark ? 'SÁNG' : 'TỐI'}
        </button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {statsData.map((item) => (
            <StatCard key={item.label} dark={dark} {...item} />
          ))}
        </div>

        <div className='dashboard-grid-2'>
          <Block dark={dark} title='Chi Phí Lương Theo Phòng Ban'>
            <ResponsiveContainer width='100%' height={210}>
              <PieChart>
                <Pie data={salaryByDeptPie.length > 0 ? salaryByDeptPie : [{ name: 'Không có dữ liệu', value: 100, color: '#ccc' }]} cx='50%' cy='50%' innerRadius={0} outerRadius={80} dataKey='value' label={({ name, value }) => `${name}: ${value}%`} labelLine={false} fontSize={10}>
                  {(salaryByDeptPie.length > 0 ? salaryByDeptPie : [{ name: 'Không có dữ liệu', value: 100, color: '#ccc' }]).map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: dark ? '#162030' : '#fff', border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Block>

          <Block dark={dark} title='Số Lượng Nhân Viên Theo Phòng Ban'>
            <ResponsiveContainer width='100%' height={280}>
              <BarChart data={headcountByDept.length > 0 ? headcountByDept : [{ quarter: 'Q1', name: 'Nhân viên', count: totalEmployees }]} barSize={22} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray='3 3' stroke={dark ? '#243040' : '#eaf0f4'} />
                <XAxis dataKey='name' tick={renderCustomXAxisTick} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey='count' fill='#2a7a8c' radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Block>
        </div>

        <div className='dashboard-grid-3'>
          <Block dark={dark} title='Xu Hướng Lương Hàng Tháng'>
            <ResponsiveContainer width='100%' height={220}>
              <LineChart data={salaryByUnit}>
                <CartesianGrid strokeDasharray='3 3' stroke={dark ? '#243040' : '#eaf0f4'} />
                <XAxis dataKey='month' tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {departments.slice(0, 5).map((dept, i) => (
                  <Line key={dept.DepartmentID || i} type='monotone' dataKey={dept.DepartmentName || `PB${i}`} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Block>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Block dark={dark} title='Thông Báo & Cảnh Báo' style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alertNotifications.length > 0 ? (
                  alertNotifications.map((n) => (
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
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: muted }}>Hiện không có cảnh báo.</div>
                )}
              </div>
            </Block>

            <Block dark={dark} title='Phân Bố Nhân Viên Theo Chức Danh'>
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
          title={`Danh Sách Nhân Viên ${filtered.length < enrichedEmployees.length ? `(${filtered.length} kết quả)` : `- ${enrichedEmployees.length} tổng cộng`}`}
          action={
            <button onClick={() => setEmpModal(true)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Xem Tất Cả
            </button>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${border}` }}>
                  {['Ảnh Đại Diện', 'Tên', 'Chức Danh', 'Phòng Ban', 'Trạng Thái'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const pc = dark ? perfColorDark('Good') : perfColor('Good');
                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 1 ? (dark ? '#1a2838' : '#f8fbfc') : 'transparent' }}>
                      <td style={{ padding: '10px 12px' }}><Avatar name={e.name} size={30} /></td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: text, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</td>
                      <td style={{ padding: '10px 12px', color: muted, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.role}</td>
                      <td style={{ padding: '10px 12px', color: muted, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.dept}</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ background: pc.bg, color: pc.text, borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 700, display: 'inline-block' }}>{e.status}</span></td>
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
              <span style={{ fontSize: 17, fontWeight: 800, color: text }}>Danh Sách Đầy Đủ Nhân Viên</span>
              <button onClick={() => setEmpModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: muted }}>X</button>
            </div>
            <input
              placeholder='Tìm theo tên, chức danh, hoặc phòng ban...'
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