/**
 * Application Constants
 */

// User Roles
export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
  MANAGER: 'Manager',
};

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
  TERMINATED: 'Terminated',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
  LEAVE: 'Leave',
};

// Payroll Months
export const PAYROLL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Departments
export const DEPARTMENTS = [
  'HR',
  'IT',
  'Finance',
  'Sales',
  'Operations',
  'Marketing',
  'Development',
];

// Colors
export const COLORS = {
  PRIMARY: '#4299e1',
  SECONDARY: '#818cf8',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  LIGHT: '#f3f4f6',
  DARK: '#1f2937',
};

// API Endpoints
export const API_ENDPOINTS = {
  EMPLOYEES: '/employees',
  ATTENDANCE: '/attendance',
  PAYROLL: '/payroll',
  DEPARTMENTS: '/departments',
  AUTH: '/auth',
};

// Pagination
export const PAGINATION = {
  PAGE_SIZE: 10,
  MAX_PAGES: 5,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'authToken',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  FULL: 'MMMM d, yyyy',
};

// Salary Ranges
export const SALARY_RANGES = [
  { label: '0-5K', min: 0, max: 5000 },
  { label: '5K-10K', min: 5000, max: 10000 },
  { label: '10K-15K', min: 10000, max: 15000 },
  { label: '15K+', min: 15000, max: Infinity },
];

// Export all constants
export default {
  ROLES,
  EMPLOYEE_STATUS,
  ATTENDANCE_STATUS,
  PAYROLL_MONTHS,
  DEPARTMENTS,
  COLORS,
  API_ENDPOINTS,
  PAGINATION,
  STORAGE_KEYS,
  DATE_FORMATS,
  SALARY_RANGES,
};
