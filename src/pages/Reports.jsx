import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../api/axios';
import '../styles/pages.css';

const Reports = () => {
  const [reportType, setReportType] = useState('hr');
  const [hrReport, setHrReport] = useState([]);
  const [payrollReport, setPayrollReport] = useState([]);
  const [dividendReport, setDividendReport] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (type) => {
    setLoading(true);
    try {
      if (type === 'hr') {
        const res = await api.get('/reports/hr');
        setHrReport(Array.isArray(res.data) ? res.data : []);
      } else if (type === 'payroll') {
        const res = await api.get('/reports/payroll');
        setPayrollReport(Array.isArray(res.data) ? res.data : []);
      } else if (type === 'dividends') {
        const res = await api.get('/reports/dividends');
        setDividendReport(Array.isArray(res.data) ? res.data : []);
      } else if (type === 'attendance') {
        const res = await api.get('/attendance');
        setAttendance(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(reportType);
  }, [reportType]);

  const handleExport = (format) => {
    const reportName = reportType.charAt(0).toUpperCase() + reportType.slice(1);
    alert(`📄 Export ${reportName} Report as ${format}`);
  };

  const renderTable = (columns, data) => {
    if (!data || data.length === 0) {
      return <p style={{ color: '#8ca0af', padding: 20, textAlign: 'center' }}>No data available</p>;
    }
    return (
      <div className="summary-table">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key] !== undefined ? String(row[col.key]) : 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="page-container">
      <Header
        title="Reports & Analytics"
        subtitle="View and export comprehensive reports from the system"
      />

      <Card title="Report Settings">
        <div className="report-controls">
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-control"
            >
              <option value="hr">HR Report (Employees by Dept)</option>
              <option value="payroll">Payroll Report (Earnings by Employee)</option>
              <option value="attendance">Attendance Report</option>
              <option value="dividends">Dividend History</option>
            </select>
          </div>

          <div className="form-actions">
            <Button label="📄 Export PDF" onClick={() => handleExport('PDF')} variant="primary" />
            <Button label="📊 Export Excel" onClick={() => handleExport('Excel')} variant="primary" />
            <Button label="🔄 Refresh" onClick={() => fetchData(reportType)} variant="secondary" />
          </div>
        </div>
      </Card>

      {loading && <Card title="Loading..."><p style={{ color: '#8ca0af' }}>Đang tải dữ liệu...</p></Card>}

      {!loading && reportType === 'hr' && (
        <Card title={`HR Report - Employees by Department (${hrReport.length})`}>
          {renderTable(
            [
              { key: 'DepartmentName', label: 'Department' },
              { key: 'TotalEmployees', label: 'Total Employees' },
            ],
            hrReport
          )}
        </Card>
      )}

      {!loading && reportType === 'payroll' && (
        <Card title={`Payroll Report - Total Earnings by Employee (${payrollReport.length})`}>
          {renderTable(
            [
              { key: 'EmployeeID', label: 'Employee ID' },
              { key: 'FullName', label: 'Full Name' },
              { key: 'DepartmentName', label: 'Department' },
              { key: 'TotalEarnings', label: 'Total Earnings (₫)' },
            ],
            payrollReport.map((r) => ({
              ...r,
              TotalEarnings: Number(r.TotalEarnings || 0).toLocaleString('vi-VN') + '₫',
            }))
          )}

          {payrollReport.length > 0 && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0f8fa', borderRadius: 8 }}>
              <strong>Total Payroll: </strong>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1a2a38' }}>
                {(payrollReport.reduce((s, r) => s + (Number(r.TotalEarnings) || 0), 0)).toLocaleString('vi-VN')}₫
              </span>
            </div>
          )}
        </Card>
      )}

      {!loading && reportType === 'attendance' && (
        <Card title={`Attendance Report (${attendance.length} records)`}>
          {attendance.length > 0 ? (
            renderTable(
              Object.keys(attendance[0] || {}).map((k) => ({ key: k, label: k })),
              attendance
            )
          ) : (
            <p style={{ color: '#8ca0af', padding: 20, textAlign: 'center' }}>No attendance records found.</p>
          )}
        </Card>
      )}

      {!loading && reportType === 'dividends' && (
        <Card title={`Dividend History (${dividendReport.length} records)`}>
          {dividendReport.length > 0 ? (
            renderTable(
              Object.keys(dividendReport[0] || {}).map((k) => ({ key: k, label: k })),
              dividendReport
            )
          ) : (
            <p style={{ color: '#8ca0af', padding: 20, textAlign: 'center' }}>No dividend records found.</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Reports;