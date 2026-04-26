import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaPlay, FaUsers, FaCalendar, FaInfoCircle } from 'react-icons/fa';
import { payrollAPI, employeeAPI } from '../services/api';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

function PayrollGenerator() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const [employees,        setEmployees]        = useState([]);
  const [selectedIds,      setSelectedIds]      = useState([]);
  const [salaryMonth,      setSalaryMonth]      = useState(defaultMonth);
  const [baseSalary,       setBaseSalary]       = useState(5000000);
  const [generating,       setGenerating]       = useState(false);
  const [result,           setResult]           = useState(null);
  const [salaryRecords,    setSalaryRecords]    = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    employeeAPI.search({ status: 'Đang làm việc' }, 1, 200)
      .then(r => setEmployees(r.data.employees))
      .catch(() => toast.error('Không thể tải danh sách nhân viên'))
      .finally(() => setLoadingEmployees(false));
  }, []);

  useEffect(() => {
    if (!salaryMonth) return;
    payrollAPI.getSalaries(null, salaryMonth, 1, 200)
      .then(r => setSalaryRecords(r.data.records))
      .catch(() => {});
  }, [salaryMonth]);

  const toggleAll = () =>
    setSelectedIds(prev =>
      prev.length === employees.length ? [] : employees.map(e => e.EmployeeID)
    );

  const toggleEmp = (id) =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handleGenerate = async () => {
    if (!salaryMonth)                   { toast.error('Vui lòng chọn tháng lương'); return; }
    if (!baseSalary || baseSalary <= 0) { toast.error('Vui lòng nhập lương cơ bản hợp lệ'); return; }

    setGenerating(true);
    setResult(null);
    try {
      const r = await payrollAPI.generatePayroll({
        employee_ids: selectedIds.length ? selectedIds : null,
        salary_month: salaryMonth,
        base_salary:  parseFloat(baseSalary),
      });
      setResult(r.data);
      toast.success(r.data.message);
      payrollAPI.getSalaries(null, salaryMonth, 1, 200).then(r2 => setSalaryRecords(r2.data.records));
    } catch {
      toast.error('Tạo bảng lương thất bại');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#bee3f8' }}>
            <FaUsers style={{ color: '#2b6cb0' }} />
          </div>
          <div className="stat-card-value">{employees.length}</div>
          <div className="stat-card-label">Nhân Viên Đang Làm Việc</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#c6f6d5' }}>
            <FaMoneyBillWave style={{ color: '#276749' }} />
          </div>
          <div className="stat-card-value">{salaryRecords.length}</div>
          <div className="stat-card-label">Bản Ghi Lương Tháng Này</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2><FaMoneyBillWave /> Tạo Bảng Lương</h2>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><FaCalendar style={{ marginRight: 6 }} />Tháng Lương</label>
              <input
                type="date" className="form-control"
                value={salaryMonth}
                onChange={e => setSalaryMonth(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lương Cơ Bản (VNĐ)</label>
              <input
                type="number" className="form-control"
                value={baseSalary}
                onChange={e => setBaseSalary(e.target.value)}
                min="0" step="100000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaUsers style={{ marginRight: 6 }} />
              Chọn Nhân Viên&nbsp;
              <span style={{ color: '#718096', fontWeight: 400 }}>
                ({selectedIds.length} đã chọn — để trống để chọn tất cả)
              </span>
            </label>
            <div style={{ marginBottom: 10 }}>
              <button className="btn btn-sm btn-secondary" onClick={toggleAll}>
                {selectedIds.length === employees.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            <div style={{
              maxHeight: 260, overflowY: 'auto',
              border: '1px solid #e2e8f0', borderRadius: 8, padding: 12,
            }}>
              {loadingEmployees ? (
                <div className="loading"><div className="spinner" /></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 6 }}>
                  {employees.map(emp => (
                    <label
                      key={emp.EmployeeID}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                        background: selectedIds.includes(emp.EmployeeID) ? '#ebf8ff' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.EmployeeID)}
                        onChange={() => toggleEmp(emp.EmployeeID)}
                      />
                      <span style={{ fontWeight: 500 }}>{emp.FullName}</span>
                      <span style={{ color: '#718096', fontSize: '.82rem' }}>
                        {emp.DepartmentName ? `(${emp.DepartmentName})` : ''}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-success" onClick={handleGenerate} disabled={generating}>
            <FaPlay /> {generating ? 'Đang tạo…' : 'Tạo Bảng Lương'}
          </button>

          {result && (
            <div style={{ marginTop: 28 }}>
              <div className="alert alert-info" style={{ marginBottom: 14 }}>
                <FaInfoCircle /> {result.message}
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Nhân Viên</th><th>Trạng Thái</th>
                      <th>Lương Thực Nhận</th><th>Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.details.map((d, i) => (
                      <tr key={i}>
                        <td>{d.employee_id}</td>
                        <td>{d.employee_name}</td>
                        <td>
                          <span className={`badge ${
                            d.status === 'success' ? 'badge-success' :
                            d.status === 'skipped' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {d.status === 'success' ? 'Thành công' :
                             d.status === 'skipped' ? 'Bỏ qua' : 'Thất bại'}
                          </span>
                        </td>
                        <td>{d.net_salary != null ? fmt(d.net_salary) : '—'}</td>
                        <td style={{ fontSize: '.85rem', color: '#718096' }}>{d.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {salaryRecords.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2><FaMoneyBillWave /> Bảng Lương — {salaryMonth}</h2>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nhân Viên</th><th>Lương Cơ Bản</th>
                    <th>Thưởng</th><th>Khấu Trừ</th><th>Thực Nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryRecords.map(r => (
                    <tr key={r.SalaryID}>
                      <td><strong>{r.EmployeeName}</strong></td>
                      <td>{fmt(r.BaseSalary)}</td>
                      <td style={{ color: '#38a169' }}>+{fmt(r.Bonus)}</td>
                      <td style={{ color: '#e53e3e' }}>-{fmt(r.Deductions)}</td>
                      <td><strong>{fmt(r.NetSalary)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollGenerator;