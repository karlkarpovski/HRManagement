import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaSync, FaUser } from 'react-icons/fa';
import { employeeAPI, syncAPI } from '../services/api';

function EmployeeForm({ onSuccess }) {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [depts,     setDepts]     = useState([]);
  const [positions, setPositions] = useState([]);
  const [syncAfter, setSyncAfter] = useState(true);

  const emptyForm = {
    FullName: '', DateOfBirth: '', Gender: '',
    PhoneNumber: '', Email: '', HireDate: '',
    Status: 'Đang làm việc', DepartmentID: '', PositionID: '',
  };

  const [form,   setForm]   = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dRes, pRes] = await Promise.all([
          employeeAPI.getDepartments(),
          employeeAPI.getPositions(),
        ]);
        setDepts(dRes.data);
        setPositions(pRes.data);

        if (isEdit) {
          const eRes = await employeeAPI.getById(id);
          const e = eRes.data;
          setForm({
            FullName:     e.FullName     || '',
            DateOfBirth:  e.DateOfBirth  || '',
            Gender:       e.Gender       || '',
            PhoneNumber:  e.PhoneNumber  || '',
            Email:        e.Email        || '',
            HireDate:     e.HireDate     || '',
            Status:       e.Status       || 'Đang làm việc',
            DepartmentID: e.DepartmentID || '',
            PositionID:   e.PositionID   || '',
          });
        }
      } catch {
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.FullName.trim()) errs.FullName    = 'Họ tên là bắt buộc';
    if (!form.DateOfBirth)     errs.DateOfBirth  = 'Ngày sinh là bắt buộc';
    if (!form.HireDate)        errs.HireDate     = 'Ngày vào làm là bắt buộc';
    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email))
      errs.Email = 'Email không hợp lệ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Vui lòng sửa các lỗi trong form'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        DepartmentID: form.DepartmentID ? parseInt(form.DepartmentID) : null,
        PositionID:   form.PositionID   ? parseInt(form.PositionID)   : null,
        DateOfBirth:  form.DateOfBirth  || null,
        HireDate:     form.HireDate     || null,
      };

      let saved;
      if (isEdit) {
        const r = await employeeAPI.update(id, payload);
        saved = r.data;
        toast.success('Cập nhật nhân viên thành công');
      } else {
        const r = await employeeAPI.create(payload);
        saved = r.data;
        toast.success('Thêm nhân viên thành công');
      }

      if (syncAfter && saved?.EmployeeID) {
        try {
          await syncAPI.syncEmployees([saved.EmployeeID]);
          toast.success('Đã đồng bộ sang hệ thống lương');
        } catch {
          toast.warning('Đã lưu nhưng đồng bộ lương thất bại');
        }
      }

      if (onSuccess) onSuccess();
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Lưu nhân viên thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="card">
        <div className="card-body"><div className="loading"><div className="spinner" /></div></div>
      </div>
    );

  return (
    <div className="card">
      <div className="card-header">
        <h2><FaUser /> {isEdit ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}</h2>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Họ Tên <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                type="text" name="FullName"
                className={`form-control ${errors.FullName ? 'error' : ''}`}
                value={form.FullName} onChange={onChange}
                placeholder="Nhập họ tên"
              />
              {errors.FullName && <span className="error-text">{errors.FullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" name="Email"
                className={`form-control ${errors.Email ? 'error' : ''}`}
                value={form.Email} onChange={onChange}
                placeholder="Nhập email"
              />
              {errors.Email && <span className="error-text">{errors.Email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngày Sinh <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                type="date" name="DateOfBirth"
                className={`form-control ${errors.DateOfBirth ? 'error' : ''}`}
                value={form.DateOfBirth} onChange={onChange}
              />
              {errors.DateOfBirth && <span className="error-text">{errors.DateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Ngày Vào Làm <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                type="date" name="HireDate"
                className={`form-control ${errors.HireDate ? 'error' : ''}`}
                value={form.HireDate} onChange={onChange}
              />
              {errors.HireDate && <span className="error-text">{errors.HireDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số Điện Thoại</label>
              <input
                type="text" name="PhoneNumber"
                className="form-control"
                value={form.PhoneNumber} onChange={onChange}
                placeholder="Nhập số điện thoại" maxLength={15}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giới Tính</label>
              <select name="Gender" className="form-control" value={form.Gender} onChange={onChange}>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phòng Ban</label>
              <select name="DepartmentID" className="form-control" value={form.DepartmentID} onChange={onChange}>
                <option value="">Chọn phòng ban</option>
                {depts.map(d => (
                  <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Chức Vụ</label>
              <select name="PositionID" className="form-control" value={form.PositionID} onChange={onChange}>
                <option value="">Chọn chức vụ</option>
                {positions.map(p => (
                  <option key={p.PositionID} value={p.PositionID}>{p.PositionName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trạng Thái</label>
              <select name="Status" className="form-control" value={form.Status} onChange={onChange}>
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Thử việc">Thử việc</option>
                <option value="Thực tập">Thực tập</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
              </select>
            </div>
            <div className="form-group" />
          </div>

          <div className="form-group">
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', padding: '12px 16px',
              background: '#f0fff4', borderRadius: 8, border: '1px solid #c6f6d5',
            }}>
              <input
                type="checkbox"
                checked={syncAfter}
                onChange={e => setSyncAfter(e.target.checked)}
                style={{ width: 17, height: 17 }}
              />
              <FaSync style={{ color: '#38a169' }} />
              <span style={{ color: '#276749', fontWeight: 500 }}>
                Đồng bộ sang hệ thống lương sau khi lưu
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: '1px solid #e2e8f0', marginTop: 8 }}>
            <button type="submit" className="btn btn-success" disabled={saving}>
              <FaSave /> {saving ? 'Đang lưu…' : isEdit ? 'Cập Nhật' : 'Thêm Nhân Viên'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')} disabled={saving}>
              <FaTimes /> Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;