/**
 * Department Service - Handles all department API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const departmentService = {
  /**
   * Get all departments
   */
  getAllDepartments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`);
      if (!response.ok) throw new Error('Failed to fetch departments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch department');
      return await response.json();
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  /**
   * Create new department
   */
  createDepartment: async (departmentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentData),
      });
      if (!response.ok) throw new Error('Failed to create department');
      return await response.json();
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  /**
   * Update department
   */
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentData),
      });
      if (!response.ok) throw new Error('Failed to update department');
      return await response.json();
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete department');
      return await response.json();
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  /**
   * Get employees by department
   */
  getEmployeesByDepartment: async (departmentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departments/${departmentId}/employees`
      );
      if (!response.ok) throw new Error('Failed to fetch department employees');
      return await response.json();
    } catch (error) {
      console.error('Error fetching department employees:', error);
      throw error;
    }
  },
};

export default departmentService;
