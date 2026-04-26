import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const employeeAPI = {
  getAll: (page = 1, pageSize = 10, sortBy = 'EmployeeID', sortOrder = 'asc') =>
    api.get('/employees', { params: { page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder } }),

  search: (params = {}, page = 1, pageSize = 10) =>
    api.post('/employees/search', params, { params: { page, page_size: pageSize } }),

  getById: (id) => api.get(`/employees/${id}`),

  create: (data) => api.post('/employees', data),

  update: (id, data) => api.put(`/employees/${id}`, data),

  delete: (id) => api.delete(`/employees/${id}`),

  getDepartments: () => api.get('/employees/departments'),

  getPositions: () => api.get('/employees/positions'),
};

export const payrollAPI = {
  getSalaries: (employeeId = null, salaryMonth = null, page = 1, pageSize = 10) =>
    api.get('/payroll/salaries', {
      params: { employee_id: employeeId, salary_month: salaryMonth, page, page_size: pageSize },
    }),

  generatePayroll: (data) => api.post('/payroll/generate', data),

  getAttendance: (employeeId = null, month = null) =>
    api.get('/payroll/attendance', { params: { employee_id: employeeId, month } }),

  getPayrollProfile: (employeeId) => api.get(`/payroll/employee/${employeeId}/profile`),
};

export const syncAPI = {
  syncEmployees: (employeeIds = null) =>
    api.post('/sync/employees', { employee_ids: employeeIds }),

  syncAll: () => api.post('/sync/all'),

  validateDeletion: (employeeId) =>
    api.post('/sync/validate-deletion', { employee_id: employeeId }),

  deleteEmployee: (employeeId, forceDelete = false, cascadeDelete = false) =>
    api.post('/sync/delete-employee', {
      employee_id:    employeeId,
      force_delete:   forceDelete,
      cascade_delete: cascadeDelete,
    }),
};

export default api;