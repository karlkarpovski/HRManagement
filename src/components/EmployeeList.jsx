import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSync, FaUsers } from 'react-icons/fa';

import { employeeAPI, syncAPI } from '../services/api';
import EmployeeSearch     from './EmployeeSearch';
import DeleteConfirmation from './DeleteConfirmation';

const STATUS_BADGE = {
  'Đang làm việc': 'badge-success',
  'Thử việc':      'badge-info',
  'Thực tập':      'badge-warning',
  'Nghỉ phép':     'badge-danger',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

function EmployeeList({ onRefresh }) {
  const navigate = useNavigate();

  const [employees,    setEmployees]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [departments,  setDepts]        = useState([]);
  const [positions,    setPositions]    = useState([]);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [searchParams, setSearchParams] = useState({});
  const [syncingId,    setSyncingId]    = useState(null);
  const [deleteModal,  setDeleteModal]  = useState({ open: false, employee: null });

  const pageSize = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.search(searchParams, page, pageSize);
      setEmployees(res.data.employees);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
    } catch {
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [page, searchParams]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    Promise.all([employeeAPI.getDepartments(), employeeAPI.getPositions()])
      .then(([d, p]) => { setDepts(d.data); setPositions(p.data); })
      .catch(() => {});
  }, []);

  const handleSearch = (p) => { setSearchParams(p); setPage(1); };

  const handleSync = async (emp) => {
    setSyncingId(emp.EmployeeID);
    try {
      await syncAPI.syncEmployees([emp.EmployeeID]);
      toast.success(`Đã đồng bộ "${emp.FullName}" sang hệ thống lương`);
    } catch {
      toast.error('Đồng bộ thất bại');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteConfirm = async (cascadeDelete) => {
    const { employee } = deleteModal;
    try {
      await syncAPI.deleteEmployee(employee.EmployeeID, false, cascadeDelete);
      toast.success(`Đã xóa "${employee.FullName}"`);
      setDeleteModal({ open: false, employee: null });
      fetchEmployees();
      if (onRefresh) onRefresh();
    } catch (err) {
      const msg =
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        'Xóa nhân viên thất bại';
      toast.error(msg);
    }
  };

  const renderPages = () => {
    if (totalPages <= 1) return null;
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, start + 4);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="pagination">
        <button className="pagination-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
        {pages.map(n => (
          <button
            key={n}
            className={`pagination-btn${page === n ? ' active' : ''}`}
            onClick={() => setPage(n)}
          >{n}</button>
        ))}
        <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
        <button className="pagination-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        <span className="pagination-info">
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#bee3f8' }}>
            <FaUsers style={{ color: '#2b6cb0' }} />
          </div>
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">Tổng Nhân Viên</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2><FaUsers /> Quản Lý Nhân Viên</h2>
          <Link to="/employees/new" className="btn btn-primary">
            <FaPlus /> Thêm Nhân Viên
          </Link>
        </div>

        <div className="card-body">
          <EmployeeSearch onSearch={handleSearch} departments={departments} positions={positions} />

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Họ Tên</th>
                      <th>Email</th>
                      <th>Điện Thoại</th>
                      <th>Phòng Ban</th>
                      <th>Chức Vụ</th>
                      <th>Trạng Thái</th>
                      <th>Ngày Vào</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="empty-state">
                          <div className="empty-state-content">
                            <FaUsers size={44} style={{ color: '#cbd5e0' }} />
                            <h3>Không tìm thấy nhân viên</h3>
                            <p>Điều chỉnh bộ lọc hoặc thêm nhân viên mới.</p>
                            <Link to="/employees/new" className="btn btn-primary" style={{ marginTop: 12 }}>
                              <FaPlus /> Thêm Nhân Viên
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      employees.map(emp => (
                        <tr key={emp.EmployeeID}>
                          <td><strong>#{emp.EmployeeID}</strong></td>
                          <td><strong>{emp.FullName}</strong></td>
                          <td>{emp.Email || '—'}</td>
                          <td>{emp.PhoneNumber || '—'}</td>
                          <td>{emp.DepartmentName || '—'}</td>
                          <td>{emp.PositionName || '—'}</td>
                          <td>
                            <span className={`badge ${STATUS_BADGE[emp.Status] || 'badge-info'}`}>
                              {emp.Status}
                            </span>
                          </td>
                          <td>{fmtDate(emp.HireDate)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn action-btn-edit"
                                onClick={() => navigate(`/employees/${emp.EmployeeID}/edit`)}
                                title="Chỉnh sửa"
                              ><FaEdit /></button>
                              <button
                                className="action-btn action-btn-sync"
                                onClick={() => handleSync(emp)}
                                disabled={syncingId === emp.EmployeeID}
                                title="Đồng bộ lương"
                              >
                                <FaSync className={syncingId === emp.EmployeeID ? 'spin' : ''} />
                              </button>
                              <button
                                className="action-btn action-btn-delete"
                                onClick={() => setDeleteModal({ open: true, employee: emp })}
                                title="Xóa"
                              ><FaTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPages()}
            </>
          )}
        </div>
      </div>

      {deleteModal.open && (
        <DeleteConfirmation
          employee={deleteModal.employee}
          onClose={() => setDeleteModal({ open: false, employee: null })}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default EmployeeList;