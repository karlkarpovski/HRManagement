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

  const handleDeleteDepartment = (dept) => {
    // Soft delete: departments don't have delete endpoint, but we can warn
    alert('Phòng ban không thể xóa qua API. Vui lòng xóa ở Database hoặc vô hiệu hóa.');
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
        title="Department Management"
        subtitle="Manage departments and assign employees"
        actions={
          <Button label="➕ Add Department" onClick={handleAddDepartment} variant="primary" />
        }
      />

      <Card title="Department Summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Departments</span>
            <span className="summary-value">{totalDepts}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Employees</span>
            <span className="summary-value">{totalEmployees}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Department Size</span>
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
                <h2>{dept.DepartmentName}</h2>
                <button className="edit-btn" onClick={() => handleEditDepartment(dept)} title="Edit">✏️</button>
              </div>
              <div className="dept-info">
                <p><strong>ID:</strong> {dept.DepartmentID}</p>
                <p><strong>Employees:</strong> {empCount}</p>
              </div>
              <div className="dept-employees">
                <strong>Staff:</strong>
                <ul>
                  {deptEmployees.map((emp) => (
                    <li key={emp.EmployeeID} className="dept-employee-item">
                      <div>
                        <span className="dept-employee-name">{emp.FullName}</span>
                        <span className="dept-employee-meta">{emp.PositionName || `ID: ${emp.PositionID}`}</span>
                      </div>
                    </li>
                  ))}
                  {deptEmployees.length === 0 && <li>No employees</li>}
                </ul>
              </div>
              <Button
                label="Edit Department"
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
        title={selectedDept ? 'Edit Department' : 'Add New Department'}
      >
        <div className="form-container">
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              value={formData.DepartmentName}
              onChange={(e) => setFormData({ ...formData, DepartmentName: e.target.value })}
              placeholder="Department name"
            />
          </div>
          <div className="form-actions">
            <Button label="Save" onClick={handleSaveDepartment} variant="primary" />
            <Button label="Cancel" onClick={() => setIsModalOpen(false)} variant="secondary" />
            {selectedDept && (
              <Button label="Delete" onClick={() => handleDeleteDepartment(selectedDept)} variant="danger" />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;