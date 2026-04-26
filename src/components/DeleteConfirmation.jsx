import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaTrash, FaSpinner } from 'react-icons/fa';
import { syncAPI } from '../services/api';

function DeleteConfirmation({ employee, onClose, onConfirm }) {
  const [loading,    setLoading]    = useState(true);
  const [validation, setValidation] = useState(null);
  const [cascade,    setCascade]    = useState(false);

  useEffect(() => {
    syncAPI.validateDeletion(employee.EmployeeID)
      .then(r => setValidation(r.data))
      .catch(() => setValidation({
        can_delete:       false,
        warnings:         [],
        blocking_reasons: ['Xác thực thất bại'],
        related_records:  {},
      }))
      .finally(() => setLoading(false));
  }, [employee.EmployeeID]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FaExclamationTriangle style={{ color: '#dd6b20' }} />
            Xóa Nhân Viên
          </h3>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: 16 }}>
            Bạn có chắc muốn xóa <strong>{employee.FullName}</strong> (Mã #{employee.EmployeeID})?
          </p>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <>
              {validation?.blocking_reasons?.length > 0 && (
                <div className="alert alert-danger">
                  <FaExclamationTriangle />
                  <div>
                    <strong>Không thể xóa:</strong>
                    <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                      {validation.blocking_reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {validation?.warnings?.length > 0 && (
                <div className="alert alert-warning">
                  <FaExclamationTriangle />
                  <div>
                    <strong>Cảnh báo:</strong>
                    <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                      {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {validation?.related_records && (
                <div style={{
                  padding: '14px 16px', background: '#f7fafc',
                  borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 14,
                }}>
                  <strong style={{ fontSize: '.9rem' }}>Dữ Liệu Liên Quan:</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: '.88rem', color: '#4a5568' }}>
                    <li>Hồ sơ lương: {validation.related_records.payroll_profile ? '✅ Có' : '—'}</li>
                    <li>Bản ghi lương: {validation.related_records.salary_records ?? 0}</li>
                    <li>Bản ghi chấm công: {validation.related_records.attendance_records ?? 0}</li>
                    <li>Bản ghi cổ tức: {validation.related_records.dividends ?? 0}</li>
                  </ul>
                </div>
              )}

              {validation?.can_delete && validation?.related_records?.payroll_profile && (
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', padding: '10px 14px',
                  background: '#fff5f5', borderRadius: 8, border: '1px solid #fed7d7',
                }}>
                  <input
                    type="checkbox"
                    checked={cascade}
                    onChange={e => setCascade(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ color: '#c53030', fontSize: '.9rem', fontWeight: 500 }}>
                    Xóa cả dữ liệu lương và chấm công liên quan
                  </span>
                </label>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-danger"
            onClick={() => onConfirm(cascade)}
            disabled={loading || !validation?.can_delete}
          >
            {loading ? <FaSpinner className="spin" /> : <FaTrash />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmation;