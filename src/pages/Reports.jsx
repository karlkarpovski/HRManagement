import React, { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/pages.css';

const Reports = () => {
  const [reportType, setReportType] = useState('salary');
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  });

  const salaryData = [
    { range: '0-5K', count: 20, percentage: 16 },
    { range: '5K-10K', count: 65, percentage: 52 },
    { range: '10K-15K', count: 30, percentage: 24 },
    { range: '15K+', count: 10, percentage: 8 },
  ];

  const departmentData = [
    { name: 'IT', employees: 45, avgSalary: 8500, budget: 382500 },
    { name: 'Finance', employees: 25, avgSalary: 7200, budget: 180000 },
    { name: 'Sales', employees: 40, avgSalary: 6800, budget: 272000 },
    { name: 'HR', employees: 15, avgSalary: 7000, budget: 105000 },
  ];

  const attendanceData = [
    { status: 'Present', count: 590, percentage: 94 },
    { status: 'Absent', count: 20, percentage: 3 },
    { status: 'Late', count: 15, percentage: 2 },
    { status: 'Leave', count: 5, percentage: 1 },
  ];

  const handleExportPDF = () => {
    alert(`📄 Export PDF Report for ${reportType} (${dateRange.startDate} to ${dateRange.endDate})`);
  };

  const handleExportExcel = () => {
    alert(`📊 Export Excel Report for ${reportType} (${dateRange.startDate} to ${dateRange.endDate})`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <Header
        title="Reports & Analytics"
        subtitle="View and export comprehensive reports"
      />

      {/* Report Controls */}
      <Card title="Report Settings">
        <div className="report-controls">
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-control"
            >
              <option value="salary">Salary Report</option>
              <option value="department">Department Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="payroll">Payroll Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="form-control"
            />
          </div>

          <div className="form-actions">
            <Button
              label="📄 PDF Export"
              onClick={handleExportPDF}
              variant="primary"
            />
            <Button
              label="📊 Excel Export"
              onClick={handleExportExcel}
              variant="primary"
            />
            <Button
              label="🖨️ Print"
              onClick={handlePrint}
              variant="secondary"
            />
          </div>
        </div>
      </Card>

      {/* Dynamic Reports */}
      {reportType === 'salary' && (
        <>
          <Card title="Salary Distribution">
            <div className="report-chart">
              {salaryData.map((item) => (
                <div key={item.range} className="chart-item">
                  <div className="item-label">
                    <strong>{item.range}</strong>
                    <span className="item-count">{item.count} employees</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${item.percentage}%` }}>
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Salary Summary">
            <div className="summary-table">
              <table>
                <thead>
                  <tr>
                    <th>Salary Range</th>
                    <th>Employees</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.map((item) => (
                    <tr key={item.range}>
                      <td>{item.range}</td>
                      <td>{item.count}</td>
                      <td>{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {reportType === 'department' && (
        <>
          <Card title="Department Overview">
            <div className="summary-table">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Avg Salary</th>
                    <th>Total Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept) => (
                    <tr key={dept.name}>
                      <td>{dept.name}</td>
                      <td>{dept.employees}</td>
                      <td>$ {dept.avgSalary.toLocaleString()}</td>
                      <td>$ {dept.budget.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Employees by Department">
            <div className="report-chart">
              {departmentData.map((dept) => (
                <div key={dept.name} className="chart-item">
                  <div className="item-label">
                    <strong>{dept.name}</strong>
                    <span className="item-count">{dept.employees} employees</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${(dept.employees / 50) * 100}%` }}>
                      {dept.employees}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {reportType === 'attendance' && (
        <>
          <Card title="Attendance Summary">
            <div className="summary-table">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((item) => (
                    <tr key={item.status}>
                      <td>{item.status}</td>
                      <td>{item.count}</td>
                      <td>{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Attendance Distribution">
            <div className="report-chart">
              {attendanceData.map((item) => (
                <div key={item.status} className="chart-item">
                  <div className="item-label">
                    <strong>{item.status}</strong>
                    <span className="item-count">{item.count}</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${item.percentage * 10}%` }}>
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {reportType === 'payroll' && (
        <Card title="Payroll Summary">
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Penalty</th>
                  <th>Net Payroll</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>January 2024</td>
                  <td>$ 850,000</td>
                  <td>$ 45,000</td>
                  <td>$ 12,000</td>
                  <td>$ 883,000</td>
                </tr>
                <tr>
                  <td>February 2024</td>
                  <td>$ 850,000</td>
                  <td>$ 38,000</td>
                  <td>$ 8,000</td>
                  <td>$ 880,000</td>
                </tr>
                <tr>
                  <td>March 2024</td>
                  <td>$ 850,000</td>
                  <td>$ 52,000</td>
                  <td>$ 15,000</td>
                  <td>$ 887,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
