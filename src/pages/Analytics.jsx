import { useState, useEffect, useMemo } from 'react';
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
import '../styles/dashboard.css';

const LINE_COLORS = ['#3cbaba', '#f0c040', '#2a7a8c', '#8ecfcf', '#f08040'];
const PIE_COLORS = ['#2a7a8c', '#f0c040', '#3cbaba', '#5a8a9f', '#8ecfcf', '#f08040'];

const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

function AnalyticsPage() {
  const [payrollReport, setPayrollReport] = useState([]);
  const [hrReport, setHrReport] = useState([]);
  const [dividendReport, setDividendReport] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [payrollRes, hrRes, divRes, empRes, deptRes] = await Promise.all([
          api.get('/reports/payroll'),
          api.get('/reports/hr'),
          api.get('/reports/dividends'),
          api.get('/employees'),
          api.get('/departments'),
        ]);
        setPayrollReport(Array.isArray(payrollRes.data) ? payrollRes.data : []);
        setHrReport(Array.isArray(hrRes.data) ? hrRes.data : []);
        setDividendReport(Array.isArray(divRes.data) ? divRes.data : []);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Department headcount data
  const deptHeadcount = useMemo(() => {
    return hrReport.map((r) => ({
      name: r.DepartmentName || 'Không xác định',
      employees: r.TotalEmployees || 0,
    }));
  }, [hrReport]);

  // Payroll by department
  const deptPayroll = useMemo(() => {
    const map = {};
    payrollReport.forEach((r) => {
      map[r.DepartmentName || 'Khác'] = (map[r.DepartmentName || 'Khác'] || 0) + (r.TotalEarnings || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [payrollReport]);

  // Top earners
  const topEarners = useMemo(() => {
    return [...payrollReport]
      .sort((a, b) => (b.TotalEarnings || 0) - (a.TotalEarnings || 0))
      .slice(0, 10)
      .map((r) => ({ name: r.FullName || 'Không xác định', earnings: r.TotalEarnings || 0 }));
  }, [payrollReport]);

  // Position distribution
  const posDist = useMemo(() => {
    const count = {};
    employees.forEach((emp) => {
      const pos = emp.PositionName || `Vị trí ${emp.PositionID || '?'}`;
      count[pos] = (count[pos] || 0) + 1;
    });
    const total = employees.length || 1;
    return Object.entries(count).map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [employees]);

  const totalEmployees = employees.length;
  const totalPayroll = payrollReport.reduce((s, r) => s + (r.TotalEarnings || 0), 0);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8ca0af' }}>Đang tải dữ liệu phân tích...</div>;
  }

  return (
    <div className='page-container' style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 800, color: '#1a2a38' }}>Bảng Phân Tích Nhân Sự</h2>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e8eef2', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#8ca0af', fontWeight: 700, textTransform: 'uppercase' }}>Tổng Số Nhân Viên</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a2a38', marginTop: 4 }}>{totalEmployees}</div>
        </div>
        <div style={{ flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e8eef2', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#8ca0af', fontWeight: 700, textTransform: 'uppercase' }}>Tổng Quỹ Lương</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a2a38', marginTop: 4 }}>{formatVND(totalPayroll)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e8eef2', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#8ca0af', fontWeight: 700, textTransform: 'uppercase' }}>Phòng Ban</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a2a38', marginTop: 4 }}>{departments.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e8eef2', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#8ca0af', fontWeight: 700, textTransform: 'uppercase' }}>Cổ Tức</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a2a38', marginTop: 4 }}>{dividendReport.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Headcount by Department */}
        <div style={{ background: '#fff', border: '1px solid #e8eef2', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2a38', marginBottom: 16 }}>Số Lượng Nhân Viên Theo Phòng Ban</h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={deptHeadcount.length > 0 ? deptHeadcount : [{ name: 'Không có dữ liệu', employees: 0 }]}>
              <CartesianGrid strokeDasharray='3 3' stroke='#eaf0f4' />
              <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#8ca0af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8ca0af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey='employees' fill='#2a7a8c' radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payroll Distribution */}
        <div style={{ background: '#fff', border: '1px solid #e8eef2', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2a38', marginBottom: 16 }}>Chi Phí Lương Theo Phòng Ban</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie data={deptPayroll.length > 0 ? deptPayroll : [{ name: 'Không có dữ liệu', value: 100 }]} cx='50%' cy='50%' innerRadius={0} outerRadius={100} dataKey='value' label={({ name, value }) => `${name}: ${formatVND(value)}`} labelLine={false} fontSize={10}>
                {(deptPayroll.length > 0 ? deptPayroll : [{ name: 'Không có dữ liệu', value: 100 }]).map((e, i) => (
                  <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatVND(parseInt(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Top Earners */}
        <div style={{ background: '#fff', border: '1px solid #e8eef2', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2a38', marginBottom: 16 }}>Top 10 Người Có Thu Nhập Cao Nhất</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8eef2' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8ca0af', letterSpacing: '0.04em' }}>Hạng</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8ca0af', letterSpacing: '0.04em' }}>Tên</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#8ca0af', letterSpacing: '0.04em' }}>Tổng Thu Nhập</th>
                </tr>
              </thead>
              <tbody>
                {topEarners.map((emp, i) => (
                  <tr key={emp.name} style={{ borderBottom: '1px solid #e8eef2', background: i % 2 === 1 ? '#f8fbfc' : 'transparent' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#3cbaba' }}>#{i + 1}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1a2a38' }}>{emp.name}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#1a2a38' }}>{formatVND(emp.earnings)}</td>
                  </tr>
                ))}
                {topEarners.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#8ca0af' }}>Không có dữ liệu lương</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Position Distribution */}
        <div style={{ background: '#fff', border: '1px solid #e8eef2', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2a38', marginBottom: 16 }}>Phân Bố Chức Danh</h3>
          <ResponsiveContainer width='100%' height={280}>
            <PieChart>
              <Pie data={posDist} cx='50%' cy='50%' innerRadius={50} outerRadius={90} dataKey='value' label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {posDist.map((e) => (
                  <Cell key={e.name} fill={e.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dividends Table */}
      {dividendReport.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8eef2', borderRadius: 14, padding: '20px 22px', marginTop: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2a38', marginBottom: 16 }}>Lịch Sử Cổ Tức</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8eef2' }}>
                  {Object.keys(dividendReport[0] || {}).map((key) => (
                    <th key={key} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8ca0af', letterSpacing: '0.04em' }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dividendReport.slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e8eef2', background: i % 2 === 1 ? '#f8fbfc' : 'transparent' }}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={{ padding: '8px 12px', color: '#1a2a38' }}>{String(val || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;