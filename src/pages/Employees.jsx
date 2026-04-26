import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Table from '../components/Table';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useEmployeesRealtime } from '../data/employeesRealtimeStore';
import { useDepartmentsRealtime } from '../data/departmentsRealtimeStore';
import '../styles/pages.css';

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  const parts = String(value).split('-').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = parts;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateDisplay = (value) => {
  const parsed = parseDateInput(value);
  if (!parsed) {
    return 'Not set';
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getBirthdayInfo = (name, value) => {
  const birthday = parseDateInput(value);
  if (!birthday) {
    return {
      label: 'Not set',
      message: `${name} does not have a date of birth on file yet.`,
      isBirthdayToday: false,
      daysUntil: null,
    };
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

  if (nextBirthday < todayMidnight) {
    nextBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
  }

  const oneDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((nextBirthday - todayMidnight) / oneDay);
  const age = nextBirthday.getFullYear() - birthday.getFullYear();

  if (daysUntil === 0) {
    return {
      label: 'Today',
      message: ` Happy Birthday, ${name}! Wishing you a fantastic year ahead. `,
      isBirthdayToday: true,
      daysUntil,
      age,
    };
  }

  return {
    label: `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
    message: ` ${name}'s birthday is on ${formatDateDisplay(value)}. Send wishes when it comes around. `,
    isBirthdayToday: false,
    daysUntil,
    age,
  };
};

const enrichEmployee = (employee) => {
  const birthdayInfo = getBirthdayInfo(employee.name, employee.dob);

  return {
    ...employee,
    dobLabel: formatDateDisplay(employee.dob),
    birthdayLabel: birthdayInfo.label,
    birthdayMessage: birthdayInfo.message,
    birthdayAge: birthdayInfo.age,
    isBirthdayToday: birthdayInfo.isBirthdayToday,
  };
};

const Employees = () => {
  const [employees, setEmployees] = useEmployeesRealtime();
  const [departments, setDepartments] = useDepartmentsRealtime();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    dob: '',
    status: 'Active',
    salary: '',
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'dobLabel', label: 'Date of Birth' },
    { key: 'salary', label: 'Salary ($)' },
    { key: 'status', label: 'Status' },
  ];

  const enrichedEmployees = useMemo(() => employees.map(enrichEmployee), [employees]);

  const departmentOptions = useMemo(() => {
    const fromDepartments = departments
      .map((department) => department.name)
      .filter(Boolean);

    const fromEmployees = employees
      .map((employee) => employee.department)
      .filter(Boolean);

    return Array.from(new Set([...fromDepartments, ...fromEmployees])).sort((a, b) => a.localeCompare(b));
  }, [departments, employees]);

  useEffect(() => {
    const employeeDepartmentNames = Array.from(
      new Set(
        employees
          .map((employee) => String(employee.department || '').trim())
          .filter(Boolean)
      )
    );

    if (employeeDepartmentNames.length === 0) {
      return;
    }

    setDepartments((current) => {
      const normalizedCurrentNames = new Set(
        current
          .map((department) => String(department.name || '').trim().toLowerCase())
          .filter(Boolean)
      );

      const missingNames = employeeDepartmentNames.filter(
        (name) => !normalizedCurrentNames.has(name.toLowerCase())
      );

      if (missingNames.length === 0) {
        return current;
      }

      let nextId = Math.max(...current.map((department) => department.id || 0), 0) + 1;
      const appendedDepartments = missingNames.map((name) => {
        const created = {
          id: nextId,
          name,
          manager: 'Unassigned',
          employees: 0,
          budget: 0,
        };
        nextId += 1;
        return created;
      });

      return [...current, ...appendedDepartments];
    });
  }, [employees, setDepartments]);

  const filteredEmployees = useMemo(() => {
    let filtered = enrichedEmployees;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term) ||
        emp.dobLabel.toLowerCase().includes(term) ||
        emp.birthdayMessage.toLowerCase().includes(term)
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    return filtered;
  }, [enrichedEmployees, searchTerm, departmentFilter]);

  const birthdayNotifications = useMemo(
    () =>
      enrichedEmployees.filter((employee) => employee.isBirthdayToday || employee.birthdayLabel === 'In 1 day' || employee.birthdayLabel === 'In 2 days' || employee.birthdayLabel === 'In 3 days' || employee.birthdayLabel === 'In 4 days' || employee.birthdayLabel === 'In 5 days' || employee.birthdayLabel === 'In 6 days' || employee.birthdayLabel === 'In 7 days'),
    [enrichedEmployees]
  );

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      department: '',
      position: '',
      dob: '',
      status: 'Active',
      salary: '',
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      department: employee.department,
      position: employee.position,
      dob: employee.dob,
      status: employee.status,
      salary: employee.salary,
    });
    setIsModalOpen(true);
  };

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setIsProfileOpen(true);
  };

  const handleSaveEmployee = () => {
    if (!formData.name || !formData.department || !formData.position || !formData.dob) {
      alert('Please fill name, department, position, and date of birth');
      return;
    }

    const normalizedDepartment = String(formData.department || '').trim();
    if (!normalizedDepartment) {
      alert('Please fill name, department, position, and date of birth');
      return;
    }

    setDepartments((current) => {
      const departmentExists = current.some(
        (department) => String(department.name || '').trim().toLowerCase() === normalizedDepartment.toLowerCase()
      );

      if (departmentExists) {
        return current;
      }

      return [
        ...current,
        {
          id: Math.max(...current.map((department) => department.id || 0), 0) + 1,
          name: normalizedDepartment,
          manager: 'Unassigned',
          employees: 0,
          budget: 0,
        },
      ];
    });

    const nextFormData = {
      ...formData,
      department: normalizedDepartment,
    };

    if (editingEmployee) {
      const nextEmployees = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? { ...emp, ...nextFormData }
          : emp
      );

      setEmployees(nextEmployees);

      if (selectedEmployee?.id === editingEmployee.id) {
        const updatedEmployee = nextEmployees.find((emp) => emp.id === editingEmployee.id);
        setSelectedEmployee(updatedEmployee ? enrichEmployee(updatedEmployee) : null);
      }
    } else {
      const newEmployee = {
        id: Math.max(...employees.map((e) => e.id), 0) + 1,
        ...nextFormData,
      };
      setEmployees((current) => [...current, newEmployee]);
      setSelectedEmployee(enrichEmployee(newEmployee));
    }

    setIsModalOpen(false);
    setFormData({
      name: '',
      department: '',
      position: '',
      dob: '',
      status: 'Active',
      salary: '',
    });
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure?')) {
      setEmployees((current) => current.filter((emp) => emp.id !== id));
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null);
        setIsProfileOpen(false);
      }
    }
  };

  const selectedProfile = selectedEmployee ? enrichEmployee(selectedEmployee) : null;

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
              {departmentOptions.map((dept) => (
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

      <Card title={`Birthday Notifications (${birthdayNotifications.length})`}>
        <div className="birthday-notifications">
          {birthdayNotifications.length > 0 ? (
            birthdayNotifications.map((employee) => (
              <div key={employee.id} className="birthday-notification-item">
                <strong>{employee.name}</strong>
                <span>{employee.birthdayMessage}</span>
                <small>{employee.dobLabel} · {employee.birthdayLabel}</small>
              </div>
            ))
          ) : (
            <p>No birthdays today or in the next week.</p>
          )}
        </div>
      </Card>

      {/* Employee Table */}
      <Card title={`Employees (${filteredEmployees.length})`}>
        <Table
          columns={columns}
          data={filteredEmployees}
          onRowClick={(employee) => handleViewProfile(employee)}
        />
      </Card>

      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={selectedProfile ? `${selectedProfile.name} Profile` : 'Employee Profile'}
      >
        {selectedProfile && (
          <div className="profile-container">
            <div className="profile-grid">
              <div className="profile-item">
                <label>ID: </label>
                <span>{selectedProfile.id}</span>
              </div>
              <div className="profile-item">
                <label>Name: </label>
                <span>{selectedProfile.name}</span>
              </div>
              <div className="profile-item">
                <label>Department: </label>
                <span>{selectedProfile.department}</span>
              </div>
              <div className="profile-item">
                <label>Position: </label>
                <span>{selectedProfile.position}</span>
              </div>
              <div className="profile-item">
                <label>Date of Birth: </label>
                <span>{selectedProfile.dobLabel}</span>
              </div>
              <div className="profile-item">
                <label>Birthday Status: </label>
                <span>{selectedProfile.birthdayLabel}</span>
              </div>
              <div className="profile-item">
                <label>Salary ($): </label>
                <span>{selectedProfile.salary}</span>
              </div>
              <div className="profile-item">
                <label>Status: </label>
                <span>{selectedProfile.status}</span>
              </div>
            </div>

            <div className="profile-message">
              <label>Birthday message: </label>
              <p>{selectedProfile.birthdayMessage}</p>
            </div>

            <div className="form-actions">
              <Button
                label="Edit Employee"
                onClick={() => {
                  handleEditEmployee(selectedProfile);
                  setIsProfileOpen(false);
                }}
                variant="primary"
              />
              <Button
                label="Close"
                onClick={() => setIsProfileOpen(false)}
                variant="secondary"
              />
            </div>
          </div>
        )}
      </Modal>

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
              {departmentOptions.map((dept) => (
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
            <label>Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
