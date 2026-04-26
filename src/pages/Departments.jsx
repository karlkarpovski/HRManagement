import React, { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useEmployeesRealtime } from '../data/employeesRealtimeStore';
import { useDepartmentsRealtime } from '../data/departmentsRealtimeStore';
import '../styles/pages.css';

const Departments = () => {
  const [departments, setDepartments] = useDepartmentsRealtime();

  const [employees] = useEmployeesRealtime();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmployeeProfileOpen, setIsEmployeeProfileOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    budget: '',
  });

  const formatCurrency = (amount) => `$ ${Number(amount || 0).toLocaleString()}`;

  const openEmployeeProfile = (employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeProfileOpen(true);
  };

  const handleAddDepartment = () => {
    setSelectedDept(null);
    setFormData({ name: '', manager: '', budget: '' });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      manager: dept.manager,
      budget: dept.budget,
    });
    setIsModalOpen(true);
  };

  const handleSaveDepartment = () => {
    if (!formData.name || !formData.manager || !formData.budget) {
      alert('Please fill all fields');
      return;
    }

    if (selectedDept) {
      setDepartments(
        departments.map((d) =>
          d.id === selectedDept.id
            ? {
                ...d,
                name: formData.name,
                manager: formData.manager,
                budget: parseInt(formData.budget, 10),
              }
            : d
        )
      );
    } else {
      const newDept = {
        id: Math.max(...departments.map((d) => d.id), 0) + 1,
        name: formData.name,
        manager: formData.manager,
        employees: 0,
        budget: parseInt(formData.budget, 10),
      };
      setDepartments([...departments, newDept]);
    }

    setIsModalOpen(false);
    alert('Department saved successfully!');
  };

  const handleDeleteDepartment = () => {
    if (window.confirm('Are you sure?')) {
      setDepartments(departments.filter((d) => d.id !== selectedDept.id));
      setIsModalOpen(false);
      alert('Department deleted!');
    }
  };

  const totalEmployees = employees.length;
  const totalBudget = departments.reduce((sum, d) => sum + d.budget, 0);

  return (
    <div className="page-container">
      <Header
        title="Department Management"
        subtitle="Manage departments and assign employees"
        actions={
          <Button
            label="➕ Add Department"
            onClick={handleAddDepartment}
            variant="primary"
          />
        }
      />

      {/* Summary */}
      <Card title="Department Summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Departments</span>
            <span className="summary-value">{departments.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Employees</span>
            <span className="summary-value">{totalEmployees}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Budget</span>
            <span className="summary-value">$ {totalBudget.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Department Size</span>
            <span className="summary-value">
              {departments.length > 0
                ? Math.round(totalEmployees / departments.length)
                : 0}
            </span>
          </div>
        </div>
      </Card>

      {/* Departments Grid */}
      <div className="departments-grid">
        {departments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.department === dept.name);
          return (
            <Card key={dept.id} className="department-card">
              <div className="dept-header">
                <h2>{dept.name}</h2>
                <button
                  className="edit-btn"
                  onClick={() => handleEditDepartment(dept)}
                  title="Edit"
                >
                  ✏️
                </button>
              </div>
              <div className="dept-info">
                <p>
                  <strong>Manager:</strong> {dept.manager}
                </p>
                <p>
                  <strong>Employees:</strong> {deptEmployees.length}
                </p>
                <p>
                  <strong>Budget:</strong> $ {dept.budget.toLocaleString()}
                </p>
              </div>
              <div className="dept-employees">
                <strong>Staff:</strong>
                <ul>
                  {deptEmployees.map((emp) => (
                    <li key={emp.id} className="dept-employee-item">
                      <div>
                        <span className="dept-employee-name">{emp.name}</span>
                        <span className="dept-employee-meta">{emp.position}</span>
                      </div>
                      <button
                        type="button"
                        className="profile-btn"
                        onClick={() => openEmployeeProfile(emp)}
                      >
                        Profile
                      </button>
                    </li>
                  ))}
                  {deptEmployees.length === 0 && <li>No employees</li>}
                </ul>
              </div>
              <Button
                label="View Details"
                onClick={() => handleEditDepartment(dept)}
                variant="secondary"
              />
            </Card>
          );
        })}
      </div>

      {/* Modal for Add/Edit */}
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Department name"
            />
          </div>

          <div className="form-group">
            <label>Manager Name</label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="Manager name"
            />
          </div>

          <div className="form-group">
            <label>Budget ($)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="form-actions">
            <Button
              label="Save"
              onClick={handleSaveDepartment}
              variant="primary"
            />
            <Button
              label="Cancel"
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
            />
            {selectedDept && (
              <Button
                label="Delete"
                onClick={handleDeleteDepartment}
                variant="danger"
              />
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEmployeeProfileOpen}
        onClose={() => setIsEmployeeProfileOpen(false)}
        title={selectedEmployee ? `${selectedEmployee.name} - Employee Profile` : 'Employee Profile'}
      >
        {selectedEmployee && (
          <div className="employee-profile-container">
            <div className="employee-profile-grid">
              <div className="employee-profile-item">
                <span className="employee-profile-label">Employee ID</span>
                <span className="employee-profile-value">{selectedEmployee.employeeCode}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Department</span>
                <span className="employee-profile-value">{selectedEmployee.department}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Position</span>
                <span className="employee-profile-value">{selectedEmployee.position}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Status</span>
                <span className="employee-profile-value">{selectedEmployee.status}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Salary</span>
                <span className="employee-profile-value">{formatCurrency(selectedEmployee.salary)}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Date of Birth</span>
                <span className="employee-profile-value">{new Date(selectedEmployee.birthday).toLocaleDateString()}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Joined On</span>
                <span className="employee-profile-value">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Email</span>
                <span className="employee-profile-value">{selectedEmployee.email}</span>
              </div>
              <div className="employee-profile-item">
                <span className="employee-profile-label">Phone</span>
                <span className="employee-profile-value">{selectedEmployee.phone}</span>
              </div>
              <div className="employee-profile-item employee-profile-item-full">
                <span className="employee-profile-label">Address</span>
                <span className="employee-profile-value">{selectedEmployee.address}</span>
              </div>
              <div className="employee-profile-item employee-profile-item-full">
                <span className="employee-profile-label">Emergency Contact</span>
                <span className="employee-profile-value">{selectedEmployee.emergencyContact}</span>
              </div>
            </div>

            <div className="form-actions">
              <Button
                label="Close"
                onClick={() => setIsEmployeeProfileOpen(false)}
                variant="secondary"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Departments;
