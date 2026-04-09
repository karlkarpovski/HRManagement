import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import '../styles/pages.css';

const Attendance = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Anil Kumar', department: 'IT' },
    { id: 2, name: 'Priya Singh', department: 'HR' },
    { id: 3, name: 'Rajesh Patel', department: 'Finance' },
    { id: 4, name: 'Neha Sharma', department: 'Sales' },
  ]);

  const [attendance, setAttendance] = useState([
    { id: 1, name: 'Anil Kumar', date: '2024-01-15', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'Present' },
    { id: 2, name: 'Priya Singh', date: '2024-01-15', checkIn: '08:45 AM', checkOut: '05:15 PM', status: 'Present' },
    { id: 3, name: 'Rajesh Patel', date: '2024-01-15', checkIn: '-', checkOut: '-', status: 'Absent' },
    { id: 4, name: 'Neha Sharma', date: '2024-01-15', checkIn: '10:30 AM', checkOut: '06:00 PM', status: 'Late' },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyStats, setMonthlyStats] = useState({
    Present: 18,
    Absent: 2,
    Late: 3,
    Leave: 2,
  });

  const columns = [
    { key: 'name', label: 'Employee' },
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check-In' },
    { key: 'checkOut', label: 'Check-Out' },
    { key: 'status', label: 'Status' },
  ];

  const handleCheckIn = () => {
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const existingRecord = attendance.find(
      (a) => a.id === parseInt(selectedEmployee) && a.date === selectedDate
    );

    if (existingRecord) {
      setAttendance(
        attendance.map((a) =>
          a.id === parseInt(selectedEmployee) && a.date === selectedDate
            ? { ...a, checkIn: currentTime, status: 'Present' }
            : a
        )
      );
    } else {
      const employee = employees.find((e) => e.id === parseInt(selectedEmployee));
      setAttendance([
        ...attendance,
        {
          id: parseInt(selectedEmployee),
          name: employee?.name,
          date: selectedDate,
          checkIn: currentTime,
          checkOut: '-',
          status: 'Present',
        },
      ]);
    }

    alert('Check-in successful!');
  };

  const handleCheckOut = () => {
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const existingRecord = attendance.find(
      (a) => a.id === parseInt(selectedEmployee) && a.date === selectedDate
    );

    if (existingRecord && existingRecord.checkIn !== '-') {
      setAttendance(
        attendance.map((a) =>
          a.id === parseInt(selectedEmployee) && a.date === selectedDate
            ? { ...a, checkOut: currentTime }
            : a
        )
      );
      alert('Check-out successful!');
    } else {
      alert('Please check-in first');
    }
  };

  const handleMarkAbsent = () => {
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    const employee = employees.find((e) => e.id === parseInt(selectedEmployee));
    const existingRecord = attendance.find(
      (a) => a.id === parseInt(selectedEmployee) && a.date === selectedDate
    );

    if (existingRecord) {
      setAttendance(
        attendance.map((a) =>
          a.id === parseInt(selectedEmployee) && a.date === selectedDate
            ? { ...a, checkIn: '-', checkOut: '-', status: 'Absent' }
            : a
        )
      );
    } else {
      setAttendance([
        ...attendance,
        {
          id: parseInt(selectedEmployee),
          name: employee?.name,
          date: selectedDate,
          checkIn: '-',
          checkOut: '-',
          status: 'Absent',
        },
      ]);
    }

    alert('Marked as absent');
  };

  return (
    <div className="page-container">
      <Header
        title="Attendance Management"
        subtitle="Track employee attendance and check-in/out"
      />

      {/* Check-In/Out Section */}
      <Card title="Check-In / Check-Out">
        <div className="attendance-form">
          <div className="form-group">
            <label>Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="form-control"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-actions">
            <Button label="✅ Check-In" onClick={handleCheckIn} variant="primary" />
            <Button label="🚪 Check-Out" onClick={handleCheckOut} variant="primary" />
            <Button label="❌ Mark Absent" onClick={handleMarkAbsent} variant="danger" />
          </div>
        </div>
      </Card>

      {/* Monthly Statistics */}
      <Card title="Monthly Statistics">
        <div className="stats-row">
          <div className="stat-box present">
            <span className="stat-label">Present</span>
            <span className="stat-value">{monthlyStats.Present}</span>
          </div>
          <div className="stat-box absent">
            <span className="stat-label">Absent</span>
            <span className="stat-value">{monthlyStats.Absent}</span>
          </div>
          <div className="stat-box late">
            <span className="stat-label">Late</span>
            <span className="stat-value">{monthlyStats.Late}</span>
          </div>
          <div className="stat-box leave">
            <span className="stat-label">Leave</span>
            <span className="stat-value">{monthlyStats.Leave}</span>
          </div>
        </div>
      </Card>

      {/* Attendance History */}
      <Card title="Attendance History">
        <Table columns={columns} data={attendance} />
      </Card>
    </div>
  );
};

export default Attendance;
