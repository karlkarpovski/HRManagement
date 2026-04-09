/**
 * Attendance Service - Handles all attendance API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const attendanceService = {
  /**
   * Fetch attendance records
   */
  getAttendance: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `${API_BASE_URL}/attendance?${queryParams}`
      );
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  /**
   * Get attendance by employee ID
   */
  getAttendanceByEmployee: async (employeeId, date) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance/employee/${employeeId}?date=${date}`
      );
      if (!response.ok) throw new Error('Failed to fetch employee attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
      throw error;
    }
  },

  /**
   * Mark attendance
   */
  markAttendance: async (attendanceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return await response.json();
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  /**
   * Get attendance report
   */
  getAttendanceReport: async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance/report?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch attendance report');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  },
};

export default attendanceService;
