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

  const handleExport = async (format) => {
    try {
      const reportName = reportType === 'hr' ? 'hr' : 
                        reportType === 'payroll' ? 'payroll' :
                        reportType === 'dividends' ? 'dividends' : 'attendance';
      
      if (reportType === 'attendance') {
        alert('Chức năng xuất báo cáo chấm công đang được phát triển');
        return;
      }
      
      // Gọi API export với responseType blob
      const url = `/reports/${reportName}/export/${format.toLowerCase()}`;
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Tạo blob URL và download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Lấy filename từ header hoặc tạo mặc định
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${reportName}_report.${format.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err) {
      console.error('Export error:', err);
      alert('Có lỗi xảy ra khi xuất báo cáo');
    }
  };

  const renderTable = (columns, data) => {
    if (!data || data.length === 0) {
      return <p style={{ color: '#8ca0af', padding: 20, textAlign: 'center' }}>Không có dữ liệu</p>;
    }
    return (
      <div className="summary-table">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ maxWidth: col.maxWidth || 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ maxWidth: col.maxWidth || 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', title: String(row[col.key] !== undefined ? row[col.key] : 'N/A') }}>{row[col.key] !== undefined ? String(row[col.key]) : 'N/A'}</td>
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
        title="Báo Cáo & Phân Tích"
        subtitle="Xem và xuất các báo cáo toàn diện từ hệ thống"
      />

      <Card title="Cài Đặt Báo Cáo">
        <div className="report-controls">
          <div className="form-group">
            <label>Loại Báo Cáo</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-control"
            >
              <option value="hr">Báo Cáo Nhân Sự (Nhân viên theo phòng ban)</option>
              <option value="payroll">Báo Cáo Lương (Thu nhập theo nhân viên)</option>
              <option value="attendance">Báo Cáo Chấm Công</option>
              <option value="dividends">Lịch Sử Cổ Tức</option>
            </select>
          </div>

          <div className="form-actions">
            <Button label="📄 Xuất PDF" onClick={() => handleExport('PDF')} variant="primary" />
            <Button label="📊 Xuất Excel" onClick={() => handleExport('Excel')} variant="primary" />
            <Button label="🔄 Làm Mới" onClick={() => fetchData(reportType)} variant="secondary" />
          </div>
        </div>
      </Card>

      {loading && <Card title="Đang tải..."><p style={{ color: '#8ca0af' }}>Đang tải dữ liệu...</p></Card>}

      {!loading && reportType === 'hr' && (
        <Card title={`Báo Cáo Nhân Sự - Nhân Viên Theo Phòng Ban (${hrReport.length})`}>
          {renderTable(
            [
              { key: 'DepartmentName', label: 'Phòng Ban' },
              { key: 'TotalEmployees', label: 'Tổng Số Nhân Viên' },
            ],
            hrReport
          )}
        </Card>
      )}

      {!loading && reportType === 'payroll' && (
        <Card title={`Báo Cáo Lương - Tổng Thu Nhập Theo Nhân Viên (${payrollReport.length})`}>
          {renderTable(
            [
              { key: 'EmployeeID', label: 'Mã Nhân Viên' },
              { key: 'FullName', label: 'Họ Tên' },
              { key: 'DepartmentName', label: 'Phòng Ban' },
              { key: 'TotalEarnings', label: 'Tổng Thu Nhập (₫)' },
            ],
            payrollReport.map((r) => ({
              ...r,
              TotalEarnings: Number(r.TotalEarnings || 0).toLocaleString('vi-VN') + '₫',
            }))
          )}

          {payrollReport.length > 0 && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0f8fa', borderRadius: 8 }}>
              <strong>Tổng Quỹ Lương: </strong>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1a2a38' }}>
                {payrollReport.reduce((s, r) => s + (Number(r.TotalEarnings) || 0), 0).toLocaleString('vi-VN')}₫
              </span>
            </div>
          )}
        </Card>
      )}

      {!loading && reportType === 'attendance' && (
        <Card title={`Báo Cáo Chấm Công (${attendance.length} bản ghi)`}>
          {attendance.length > 0 ? (
            renderTable(
              Object.keys(attendance[0] || {}).map((k) => ({ key: k, label: k })),
              attendance
            )
          ) : (
            <p style={{ color: '#8ca0af', padding: 20, textAlign: 'center' }}>Không tìm thấy bản ghi chấm công.</p>
          )}
        </Card>
      )}

      {!loading && reportType === 'dividends' && (
        <Card title={`Lịch Sử Cổ Tức (${dividendReport.length} bản ghi)`}>
          {dividendReport.length > 0 ? (
            renderTable(
              [
                { key: 'FullName', label: 'Họ Tên' },
                { key: 'PositionName', label: 'Vị Trí' },
                { key: 'RoleName', label: 'Chức Vụ' },
                { key: 'DividendAmount', label: 'Số Tiền Cổ Tức' },
                { key: 'DividendDate', label: 'Ngày Trả' }
              ],
              dividendReport.map((r) => ({
                ...r,
                DividendAmount: Number(r.DividendAmount || 0).toLocaleString('vi-VN') + '₫',
              }))
            )
          ) : (
            <p style={{ color: '#8ca0af', padding: 20, textAlign: 'center' }}>Không tìm thấy bản ghi cổ tức.</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Reports;