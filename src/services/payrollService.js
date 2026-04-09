/**
 * Payroll Service - Handles all payroll API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const payrollService = {
  /**
   * Get payroll data
   */
  getPayroll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `${API_BASE_URL}/payroll?${queryParams}`
      );
      if (!response.ok) throw new Error('Failed to fetch payroll');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payroll:', error);
      throw error;
    }
  },

  /**
   * Get payroll by employee
   */
  getPayrollByEmployee: async (employeeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payroll/employee/${employeeId}`
      );
      if (!response.ok) throw new Error('Failed to fetch employee payroll');
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee payroll:', error);
      throw error;
    }
  },

  /**
   * Calculate payroll
   */
  calculatePayroll: async (payrollData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollData),
      });
      if (!response.ok) throw new Error('Failed to calculate payroll');
      return await response.json();
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  },

  /**
   * Generate payslip
   */
  generatePayslip: async (employeeId, month, year) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payroll/payslip/${employeeId}?month=${month}&year=${year}`
      );
      if (!response.ok) throw new Error('Failed to generate payslip');
      return await response.json();
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  },

  /**
   * Process payroll
   */
  processPayroll: async (payrollData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollData),
      });
      if (!response.ok) throw new Error('Failed to process payroll');
      return await response.json();
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  },
};

export default payrollService;
