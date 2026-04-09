import React, { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import '../styles/pages.css';

const Payroll = () => {
  const [payrollData, setPayrollData] = useState([
    { id: 1, name: 'Anil Kumar', baseSalary: 8000, bonus: 500, penalty: 0, netSalary: 8500, month: 'January 2024' },
    { id: 2, name: 'Priya Singh', baseSalary: 9500, bonus: 1000, penalty: 500, netSalary: 10000, month: 'January 2024' },
    { id: 3, name: 'Rajesh Patel', baseSalary: 7000, bonus: 0, penalty: 200, netSalary: 6800, month: 'January 2024' },
    { id: 4, name: 'Neha Sharma', baseSalary: 6500, bonus: 500, penalty: 0, netSalary: 7000, month: 'January 2024' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('January 2024');
  const [formData, setFormData] = useState({
    baseSalary: '',
    bonus: '',
    penalty: '',
  });

  const columns = [
    { key: 'name', label: 'Employee' },
    { key: 'baseSalary', label: 'Base Salary' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'penalty', label: 'Penalty' },
    { key: 'netSalary', label: 'Net Salary' },
  ];

  const calculateNetSalary = (base, bonus, penalty) => {
    return parseInt(base || 0) + parseInt(bonus || 0) - parseInt(penalty || 0);
  };

  const handleEditPayroll = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      baseSalary: payroll.baseSalary,
      bonus: payroll.bonus,
      penalty: payroll.penalty,
    });
    setIsModalOpen(true);
  };

  const handleSavePayroll = () => {
    if (!formData.baseSalary) {
      alert('Please enter base salary');
      return;
    }

    const netSalary = calculateNetSalary(
      formData.baseSalary,
      formData.bonus,
      formData.penalty
    );

    if (editingPayroll) {
      setPayrollData(
        payrollData.map((p) =>
          p.id === editingPayroll.id
            ? {
                ...p,
                baseSalary: parseInt(formData.baseSalary),
                bonus: parseInt(formData.bonus || 0),
                penalty: parseInt(formData.penalty || 0),
                netSalary: netSalary,
              }
            : p
        )
      );
    }

    setIsModalOpen(false);
    alert('Payroll updated successfully!');
  };

  const handleProcessPayroll = () => {
    alert(`Payroll for ${selectedMonth} has been processed and payments initiated!`);
  };

  const handleGeneratePayslips = () => {
    alert(`Payslips for ${selectedMonth} have been generated and sent to employees!`);
  };

  const totalBaseSalary = payrollData.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalBonus = payrollData.reduce((sum, p) => sum + p.bonus, 0);
  const totalPenalty = payrollData.reduce((sum, p) => sum + p.penalty, 0);
  const totalNetSalary = payrollData.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="page-container">
      <Header
        title="Payroll Management"
        subtitle="Manage employee salaries, bonuses, and penalties"
      />

      {/* Payroll Controls */}
      <Card title="Payroll Period">
        <div className="payroll-controls">
          <div className="form-group">
            <label>Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-control"
            >
              <option value="January 2024">January 2024</option>
              <option value="February 2024">February 2024</option>
              <option value="March 2024">March 2024</option>
              <option value="April 2024">April 2024</option>
            </select>
          </div>

          <div className="form-actions">
            <Button
              label="💿 Process Payroll"
              onClick={handleProcessPayroll}
              variant="primary"
            />
            <Button
              label="📄 Generate Payslips"
              onClick={handleGeneratePayslips}
              variant="primary"
            />
            <Button
              label="📊 Export Report"
              onClick={() => alert('Payroll report exported!')}
              variant="secondary"
            />
          </div>
        </div>
      </Card>

      {/* Payroll Summary */}
      <Card title="Payroll Summary">
        <div className="payroll-summary">
          <div className="summary-box">
            <span className="summary-label">Total Base Salary</span>
            <span className="summary-value">Rs. {totalBaseSalary.toLocaleString()}</span>
          </div>
          <div className="summary-box">
            <span className="summary-label">Total Bonus</span>
            <span className="summary-value bonus">+ Rs. {totalBonus.toLocaleString()}</span>
          </div>
          <div className="summary-box">
            <span className="summary-label">Total Penalty</span>
            <span className="summary-value penalty">- Rs. {totalPenalty.toLocaleString()}</span>
          </div>
          <div className="summary-box total">
            <span className="summary-label">Total Payroll</span>
            <span className="summary-value">Rs. {totalNetSalary.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Payroll Table */}
      <Card title={`Payroll for ${selectedMonth} (${payrollData.length} employees)`}>
        <Table
          columns={columns}
          data={payrollData}
          onRowClick={(payroll) => handleEditPayroll(payroll)}
        />
      </Card>

      {/* Modal for Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Payroll - ${editingPayroll?.name}`}
      >
        <div className="form-container">
          <div className="form-group">
            <label>Base Salary (Rs.)</label>
            <input
              type="number"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Bonus (Rs.)</label>
            <input
              type="number"
              value={formData.bonus}
              onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Penalty/Deduction (Rs.)</label>
            <input
              type="number"
              value={formData.penalty}
              onChange={(e) => setFormData({ ...formData, penalty: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Net Salary (Rs.)</label>
            <input
              type="number"
              value={calculateNetSalary(
                formData.baseSalary,
                formData.bonus,
                formData.penalty
              )}
              disabled
              readOnly
            />
          </div>

          <div className="form-actions">
            <Button
              label="Save"
              onClick={handleSavePayroll}
              variant="primary"
            />
            <Button
              label="Cancel"
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;
