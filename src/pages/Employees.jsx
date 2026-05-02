import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Table from '../components/Table';
import Card from '../components/Card';
import Modal from '../components/Modal';
import '../styles/pages.css';
import api from '../api/axios';

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (dateStr) => {
  const d = parseDate(dateStr);
  return d ? d.toLocaleDateString('vi-VN') : 'N/A';
};

const getBirthdayStatus = (dobStr) => {
  const dob = parseDate(dobStr);
  if (!dob) return { label: 'N/A', message: 'Chưa có dữ liệu', isToday: false, daysUntil: 999 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextBDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBDay < today) nextBDay.setFullYear(today.getFullYear() + 1);
  
  const diff = Math.ceil((nextBDay - today) / (1000 * 60 * 60 * 24));
  return {
    label: diff === 0 ? 'Hôm nay 🎂' : `Còn ${diff} ngày`,
    message: diff === 0 ? 'Chúc mừng sinh nhật!' : `Sắp đến sinh nhật (${diff} ngày nữa)`,
    isToday: diff === 0,
    daysUntil: diff,
  };
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    FullName: '', DepartmentID: '', PositionID: '', DateOfBirth: '', salary: '', Status: 'Active',
  });
  
  // Fetch all reference data + employees
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, posRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
        api.get('/positions'),
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setPositions(Array.isArray(posRes.data) ? posRes.data : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchAll(); }, []);
  
  const handleSaveEmployee = async () => {
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.EmployeeID}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      alert('Lỗi khi lưu thông tin!');
    }
  };
  
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchAll();
      } catch (err) {
        alert('Lỗi khi xóa nhân viên!');
      }
    }
  };
  
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({ FullName: '', DepartmentID: '', PositionID: '', DateOfBirth: '', salary: '', Status: 'Active' });
    setIsModalOpen(true);
  };
  
  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      FullName: emp.FullName || '',
      DepartmentID: emp.DepartmentID || '',
      PositionID: emp.PositionID || '',
      DateOfBirth: emp.DateOfBirth ? emp.DateOfBirth.split('T')[0] : '',
      salary: emp.salary || '',
      Status: emp.Status || 'Active',
    });
    setIsModalOpen(true);
  };
  
  const handleViewProfile = (emp) => {
    const bday = getBirthdayStatus(emp.DateOfBirth);
    setSelectedProfile({
      id: emp.EmployeeID,
      name: emp.FullName,
      departmentId: emp.DepartmentID,
      positionId: emp.PositionID,
      dobLabel: formatDate(emp.DateOfBirth),
      birthdayLabel: bday.label,
      birthdayMessage: bday.message,
      salary: emp.salary || 'N/A',
      status: emp.Status || 'Active',
      email: emp.Email || 'N/A',
    });
    setIsProfileOpen(true);
  };
  
  // Lookup maps for display names
  const deptMap = useMemo(() => {
    const m = {};
    departments.forEach((d) => { m[d.DepartmentID] = d.DepartmentName; });
    return m;
  }, [departments]);
  
  const posMap = useMemo(() => {
    const m = {};
    positions.forEach((p) => { m[p.PositionID] = p.PositionName; });
    return m;
  }, [positions]);
  
  const processedEmployees = useMemo(() => {
    return employees.map((emp) => {
      const bday = getBirthdayStatus(emp.DateOfBirth);
      return {
        ...emp,
        name: emp.FullName,
        dobLabel: formatDate(emp.DateOfBirth),
        birthdayLabel: bday.label,
        birthdayMessage: bday.message,
        daysUntil: bday.daysUntil,
        isToday: bday.isToday,
        DepartmentName: deptMap[emp.DepartmentID] || emp.DepartmentID || 'N/A',
        PositionName: posMap[emp.PositionID] || emp.PositionID || 'N/A',
      };
    });
  }, [employees, deptMap, posMap]);
  
  const departmentOptions = useMemo(() => {
    return departments.map((d) => d.DepartmentID);
  }, [departments]);
  
  const filteredEmployees = useMemo(() => {
    return processedEmployees.filter((emp) => {
      const matchesSearch = (emp.FullName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === '' || String(emp.DepartmentID) === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [processedEmployees, searchTerm, departmentFilter]);
  
  const birthdayNotifications = useMemo(
    () => processedEmployees.filter((emp) => emp.daysUntil <= 7),
    [processedEmployees]
  );
  
  const columns = [
    { key: 'EmployeeID', label: 'Mã NV', maxWidth: 80 },
    { key: 'FullName', label: 'Họ và Tên', maxWidth: 200 },
    { key: 'Email', label: 'Email', maxWidth: 220 },
    { key: 'DepartmentName', label: 'Phòng Ban', maxWidth: 180 },
    { key: 'PositionName', label: 'Chức Vụ', maxWidth: 180 },
    { key: 'dobLabel', label: 'Ngày Sinh', maxWidth: 120 },
    { key: 'Status', label: 'Trạng Thái', maxWidth: 120 },
  ];
  
  return (
    <div className="page-container">
      <Header
        title="Quản Lý Nhân Viên"
        subtitle="Quản lý tất cả nhân viên trong hệ thống"
        actions={
          <Button label="➕ Thêm Nhân Viên" onClick={handleAddEmployee} variant="primary" />
        }
      />
      
      <Card title="Bộ Lọc">
        <div className="filters-row">
          <div className="filter-group">
            <label>Tìm Kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Phòng Ban</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất Cả Phòng Ban</option>
              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentID}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <Button
              label="Đặt Lại"
              onClick={() => { setSearchTerm(''); setDepartmentFilter(''); }}
              variant="secondary"
            />
          </div>
        </div>
      </Card>
      
      <Card title={`Thông Báo Sinh Nhật (${birthdayNotifications.length})`}>
        <div className="birthday-notifications">
          {birthdayNotifications.length > 0 ? (
            birthdayNotifications.map((employee) => (
              <div key={employee.EmployeeID} className="birthday-notification-item">
                <strong>{employee.name}</strong>
                <span>{employee.birthdayMessage}</span>
                <small>{employee.dobLabel} · {employee.birthdayLabel}</small>
              </div>
            ))
          ) : (
            <p>Không có sinh nhật nào trong tuần này.</p>
          )}
        </div>
      </Card>
      
      <Card title={`Nhân Viên (${filteredEmployees.length})`}>
        <Table
          columns={columns}
          data={filteredEmployees}
          onRowClick={(employee) => handleViewProfile(employee)}
        />
      </Card>
      
      {/* Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={selectedProfile ? `${selectedProfile.name} - Hồ Sơ` : 'Hồ Sơ Nhân Viên'}
      >
        {selectedProfile && (
          <div className="profile-container">
            <div className="profile-grid">
              <div className="profile-item">
                <label>ID: </label>
                <span>{selectedProfile.id}</span>
              </div>
              <div className="profile-item">
                <label>Tên: </label>
                <span>{selectedProfile.name}</span>
              </div>
              <div className="profile-item">
                <label>Phòng Ban: </label>
                <span>{deptMap[selectedProfile.departmentId] || selectedProfile.departmentId}</span>
              </div>
              <div className="profile-item">
                <label>Chức Vụ: </label>
                <span>{posMap[selectedProfile.positionId] || selectedProfile.positionId}</span>
              </div>
              <div className="profile-item">
                <label>Ngày Sinh: </label>
                <span>{selectedProfile.dobLabel}</span>
              </div>
              <div className="profile-item">
                <label>Trạng Thái Sinh Nhật: </label>
                <span>{selectedProfile.birthdayLabel}</span>
              </div>
              <div className="profile-item">
                <label>Lương (₫): </label>
                <span>{selectedProfile.salary}</span>
              </div>
              <div className="profile-item">
                <label>Trạng Thái: </label>
                <span>{selectedProfile.status}</span>
              </div>
              <div className="profile-item">
                <label>Email: </label>
                <span>{selectedProfile.email}</span>
              </div>
            </div>
            <div className="profile-message">
              <label>Thông Báo Sinh Nhật: </label>
              <p>{selectedProfile.birthdayMessage}</p>
            </div>
            <div className="form-actions">
              <Button
                label="Chỉnh Sửa Nhân Viên"
                onClick={() => {
                  // Find full employee object and edit
                  const fullEmp = employees.find(e => e.EmployeeID === selectedProfile.id);
                  if (fullEmp) handleEditEmployee(fullEmp);
                  setIsProfileOpen(false);
                }}
                variant="primary"
              />
              <Button label="Đóng" onClick={() => setIsProfileOpen(false)} variant="secondary" />
            </div>
          </div>
        )}
      </Modal>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
      >
        <div className="form-container">
          <div className="form-group">
            <label>Tên Nhân Viên</label>
            <input
              type="text"
              value={formData.FullName}
              onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
              placeholder="Nhập tên nhân viên"
            />
          </div>
          
          <div className="form-group">
            <label>Phòng Ban</label>
            <select
              value={formData.DepartmentID}
              onChange={(e) => setFormData({ ...formData, DepartmentID: e.target.value })}
            >
              <option value="">Chọn Phòng Ban</option>
              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentID}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Chức Vụ</label>
            <select
              value={formData.PositionID}
              onChange={(e) => setFormData({ ...formData, PositionID: e.target.value })}
            >
              <option value="">Chọn Chức Vụ</option>
              {positions.map((p) => (
                <option key={p.PositionID} value={p.PositionID}>
                  {p.PositionName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Ngày Sinh</label>
            <input
              type="date"
              value={formData.DateOfBirth}
              onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Trạng Thái</label>
            <select
              value={formData.Status}
              onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
            >
              <option value="Active">Đang Hoạt Động</option>
              <option value="Inactive">Ngừng Hoạt Động</option>
              <option value="On Leave">Đang Nghỉ Phép</option>
            </select>
          </div>
          
          <div className="form-actions">
            <Button label="Lưu" onClick={handleSaveEmployee} variant="primary" />
            <Button label="Hủy" onClick={() => setIsModalOpen(false)} variant="secondary" />
            {editingEmployee && (
              <Button label="Xóa" onClick={() => {
                handleDeleteEmployee(editingEmployee.EmployeeID);
                setIsModalOpen(false);
              }} variant="danger" />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;