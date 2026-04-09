import React, { useState, useContext } from 'react';
import '../styles/sidebar.css';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = ({ activePage, setActivePage }) => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', id: 'dashboard', icon: '📊' },
    { label: 'Employees', id: 'employees', icon: '👥' },
    { label: 'Attendance', id: 'attendance', icon: '📋' },
    { label: 'Payroll', id: 'payroll', icon: '💰' },
    { label: 'Departments', id: 'departments', icon: '🏢' },
    { label: 'Reports', id: 'reports', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button 
          className="toggle-btn" 
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
        {isOpen && <h1>HR MS</h1>}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            title={item.label}
          >
            <span className="icon">{item.icon}</span>
            {isOpen && <span className="label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <div className="user-info">
            <p>User: {user?.username}</p>
            <p>Role: {user?.role}</p>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          {isOpen ? '🚪 Logout' : '🚪'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
