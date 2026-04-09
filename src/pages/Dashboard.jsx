import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 125,
    totalSalary: 850000,
    averageSalary: 6800,
    presentToday: 98,
  });

  const [chartData, setChartData] = useState({
    departments: [
      { name: 'HR', count: 15 },
      { name: 'IT', count: 45 },
      { name: 'Finance', count: 25 },
      { name: 'Sales', count: 40 },
    ],
    attendance: [
      { date: 'Mon', present: 120, absent: 5 },
      { date: 'Tue', present: 122, absent: 3 },
      { date: 'Wed', present: 118, absent: 7 },
      { date: 'Thu', present: 125, absent: 0 },
      { date: 'Fri', present: 100, absent: 25 },
    ],
  });

  return (
    <div className="page-container">
      <Header 
        title="Dashboard" 
        subtitle="Welcome to HR Management System"
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon="👥"
          color="blue"
        />
        <StatsCard
          title="Total Payroll"
          value={`Rs. ${stats.totalSalary.toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Average Salary"
          value={`Rs. ${stats.averageSalary.toLocaleString()}`}
          icon="📊"
          color="orange"
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon="✅"
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Department Distribution */}
        <Card title="Employees by Department">
          <div className="chart-container">
            {chartData.departments.map((dept) => (
              <div key={dept.name} className="chart-bar">
                <div className="bar-label">{dept.name}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(dept.count / 50) * 100}%` }}
                  >
                    {dept.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Attendance Trend */}
        <Card title="Weekly Attendance">
          <div className="chart-container">
            {chartData.attendance.map((day) => (
              <div key={day.date} className="attendance-day">
                <div className="day-label">{day.date}</div>
                <div className="attendance-bars">
                  <div className="present-bar" style={{ 
                    height: `${(day.present / 125) * 100}px` 
                  }} title={`Present: ${day.present}`}></div>
                  <div className="absent-bar" style={{ 
                    height: `${(day.absent / 125) * 100}px` 
                  }} title={`Absent: ${day.absent}`}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><span className="legend-present"></span> Present</span>
            <span><span className="legend-absent"></span> Absent</span>
          </div>
        </Card>

        {/* Salary Distribution */}
        <Card title="Salary Distribution" className="full-width">
          <div className="salary-chart">
            <div className="salary-bar">
              <span className="salary-label">Entry Level (0-3K)</span>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: '25%' }}>
                  31 employees
                </div>
              </div>
            </div>
            <div className="salary-bar">
              <span className="salary-label">Mid-Level (3K-7K)</span>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: '45%' }}>
                  56 employees
                </div>
              </div>
            </div>
            <div className="salary-bar">
              <span className="salary-label">Senior (7K-12K)</span>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: '25%' }}>
                  31 employees
                </div>
              </div>
            </div>
            <div className="salary-bar">
              <span className="salary-label">Management (12K+)</span>
              <div className="bar-bg">
                <div className="bar-value" style={{ width: '5%' }}>
                  7 employees
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="full-width">
          <div className="quick-actions">
            <button className="action-btn">➕ Add Employee</button>
            <button className="action-btn">📋 Mark Attendance</button>
            <button className="action-btn">💰 Process Payroll</button>
            <button className="action-btn">📊 Generate Report</button>
            <button className="action-btn">👥 Manage Departments</button>
            <button className="action-btn">⚙️ Settings</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
