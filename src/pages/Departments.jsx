import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import api from '../api/axios';
import '../styles/pages.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ DepartmentName: '' });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees'),
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu phòng ban:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddDepartment = () => {
    setSelectedDept(null);
    setFormData({ DepartmentName: '' });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (dept) => {
    setSelectedDept(dept);
    setFormData({ DepartmentName: dept.DepartmentName || '' });
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    if (!formData.DepartmentName.trim()) {
      alert('Vui lòng nhập tên phòng ban');
      return;
    }
    try {
      if (selectedDept) {
        await api.put(`/departments/${selectedDept.DepartmentID}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      alert('Lỗi khi lưu phòng ban!');
    }
  };

  const handleDeleteDepartment = async (dept) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${dept.DepartmentName}" không?`)) {
      return;
    }
    try {
      await api.delete(`/departments/${dept.DepartmentID}`);
      alert('Xóa phòng ban thành công!');
      fetchAll();
    } catch (err) {
      alert('Lỗi khi xóa phòng ban: ' + (err.response?.data?.error || err.message));
    }
  };

  // Count employees per department using DepartmentID
  const deptEmployeeCount = useMemo(() => {
    const count = {};
    employees.forEach((emp) => {
      const deptId = emp.DepartmentID;
      count[deptId] = (count[deptId] || 0) + 1;
    });
    return count;
  }, [employees]);

  const totalEmployees = employees.length;
  const totalDepts = departments.length;

  return (
    <div className="page-container">
      <Header
        title="Quản Lý Phòng Ban"
        subtitle="Quản lý các phòng ban và phân công nhân viên"
        actions={
          <Button label="➕ Thêm Phòng Ban" onClick={handleAddDepartment} variant="primary" />
        }
      />

      <Card title="Tổng Quan Phòng Ban">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Tổng Số Phòng Ban</span>
            <span className="summary-value">{totalDepts}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tổng Số Nhân Viên</span>
            <span className="summary-value">{totalEmployees}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Kích Thước TB</span>
            <span className="summary-value">
              {totalDepts > 0 ? Math.round(totalEmployees / totalDepts) : 0}
            </span>
          </div>
        </div>
      </Card>

      <div className="departments-grid">
        {departments.map((dept) => {
          const empCount = deptEmployeeCount[dept.DepartmentID] || 0;
          const deptEmployees = employees.filter((e) => e.DepartmentID === dept.DepartmentID);
          return (
            <Card key={dept.DepartmentID} className="department-card">
              <div className="dept-header">
                <h2 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%', title: dept.DepartmentName }}>{dept.DepartmentName}</h2>
                <button className="edit-btn" onClick={() => handleEditDepartment(dept)} title="Chỉnh Sửa">✏️</button>
              </div>
              <div className="dept-info">
                <p><strong>ID:</strong> {dept.DepartmentID}</p>
                <p><strong>Số Nhân Viên:</strong> {empCount}</p>
              </div>
              <div className="dept-employees">
                <strong>Nhân Viên:</strong>
                <ul>
                  {deptEmployees.map((emp) => (
                    <li key={emp.EmployeeID} className="dept-employee-item" style={{ overflow: 'hidden' }}>
                      <div>
                        <span className="dept-employee-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%', title: emp.FullName }}>{emp.FullName}</span>
                        <span className="dept-employee-meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%' }}>{emp.PositionName || `ID: ${emp.PositionID}`}</span>
                      </div>
                    </li>
                  ))}
                  {deptEmployees.length === 0 && <li>Không có nhân viên</li>}
                </ul>
              </div>
              <Button
                label="Chỉnh Sửa Phòng Ban"
                onClick={() => handleEditDepartment(dept)}
                variant="secondary"
              />
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDept ? 'Chỉnh Sửa Phòng Ban' : 'Thêm Phòng Ban Mới'}
      >
        <div className="form-container">
          <div className="form-group">
            <label>Tên Phòng Ban</label>
            <input
              type="text"
              value={formData.DepartmentName}
              onChange={(e) => setFormData({ ...formData, DepartmentName: e.target.value })}
              placeholder="Nhập tên phòng ban"
            />
          </div>
          <div className="form-actions">
            <Button label="Lưu" onClick={handleSaveDepartment} variant="primary" />
            <Button label="Hủy" onClick={() => setIsModalOpen(false)} variant="secondary" />
            {selectedDept && (
              <Button label="Xóa" onClick={() => handleDeleteDepartment(selectedDept)} variant="danger" />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;