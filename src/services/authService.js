/**
 * Authentication Service - Handles login/logout
 */

const authService = {
  /**
   * Mock login - Replace with actual API call
   */
  login: async (username, password) => {
    try {
      // Mock authentication - replace with actual API call
      if (username && password) {
        const user = {
          id: 1,
          username: username,
          email: `${username}@company.com`,
          role: username === 'admin' ? 'Admin' : 'User',
          token: 'mock-jwt-token-' + Date.now(),
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', user.token);
        
        return user;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get auth token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },
};

export default authService;
