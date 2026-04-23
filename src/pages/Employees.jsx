import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Table from '../components/Table';
import Card from '../components/Card';
import Modal from '../components/Modal';
import '../styles/pages.css';

const Employees = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Anil Kumar', department: 'IT', position: 'Developer', status: 'Active', salary: 8000 },
    { id: 2, name: 'Priya Singh', department: 'HR', position: 'Manager', status: 'Active', salary: 9500 },
    { id: 3, name: 'Rajesh Patel', department: 'Finance', position: 'Analyst', status: 'Active', salary: 7000 },
    { id: 4, name: 'Neha Sharma', department: 'Sales', position: 'Executive', status: 'Inactive', salary: 6500 },
    { id: 5, name: 'Arjun Verma', department: 'IT', position: 'Senior Dev', status: 'Active', salary: 12000 },
  ]);

  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    status: 'Active',
    salary: '',
  });

  const departments = ['HR', 'IT', 'Finance', 'Sales', 'Operations'];
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'salary', label: 'Salary ($)' },
    { key: 'status', label: 'Status' },
  ];

  // Filter employees
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      department: '',
      position: '',
      status: 'Active',
      salary: '',
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = () => {
    if (!formData.name || !formData.department || !formData.position) {
      alert('Please fill all fields');
      return;
    }

    if (editingEmployee) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee.id
            ? { ...emp, ...formData }
            : emp
        )
      );
    } else {
      const newEmployee = {
        id: Math.max(...employees.map((e) => e.id), 0) + 1,
        ...formData,
      };
      setEmployees([...employees, newEmployee]);
    }

    setIsModalOpen(false);
    setFormData({
      name: '',
      department: '',
      position: '',
      status: 'Active',
      salary: '',
    });
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure?')) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  return (
    <div className="page-container">
      <Header
        title="Employee Management"
        subtitle="Manage all employees in the system"
        actions={
          <Button
            label="➕ Add Employee"
            onClick={handleAddEmployee}
            variant="primary"
          />
        }
      />

      {/* Filters */}
      <Card title="Filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Button
              label="Reset"
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
              }}
              variant="secondary"
            />
          </div>
        </div>
      </Card>

      {/* Employee Table */}
      <Card title={`Employees (${filteredEmployees.length})`}>
        <Table
          columns={columns}
          data={filteredEmployees}
          onRowClick={(employee) => handleEditEmployee(employee)}
        />
      </Card>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <div className="form-container">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Employee name"
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Position"
            />
          </div>

          <div className="form-group">
            <label>Salary ($)</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="form-actions">
            <Button
              label="Save"
              onClick={handleSaveEmployee}
              variant="primary"
            />
            <Button
              label="Cancel"
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
            />
            {editingEmployee && (
              <Button
                label="Delete"
                onClick={() => {
                  handleDeleteEmployee(editingEmployee.id);
                  setIsModalOpen(false);
                }}
                variant="danger"
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
