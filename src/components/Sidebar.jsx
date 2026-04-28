import React, { useState } from 'react';
import '../styles/sidebar.css';

const NAV_GROUPS = [
  {
    label: 'Employee Management',
    icon: 'TEAM',
    items: [
      { label: 'Dashboard', id: 'dashboard' },
      { label: 'Employee List', id: 'employees' },
      { label: 'Departments', id: 'departments' },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: 'CHRT',
    items: [
      { label: 'Reports', id: 'reports' },
      { label: 'Analytics', id: 'analytics' },
    ],
  },
];

const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen, onLogout }) => {
  const [openGroup, setOpenGroup] = useState('Employee Management');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className='sidebar-header'>
        <button className='toggle-btn' onClick={() => setIsOpen((current) => !current)}>
          MENU
        </button>
        <h1 className={`sidebar-title ${isOpen ? 'visible' : ''}`}>HRMS</h1>
      </div>

      <div className='sidebar-menu'>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <button className='menu-item' onClick={() => setOpenGroup((current) => (current === group.label ? '' : group.label))}>
              <span className='icon'>{group.icon}</span>
              <span className='label'>{group.label}</span>
              <span className={`group-arrow ${openGroup === group.label ? 'open' : ''}`}>▾</span>
            </button>

            {isOpen && openGroup === group.label && (
              <div className='submenu open'>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`submenu-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => setActivePage(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='sidebar-footer'>
        <div className='user-info'>
          <p>Template Mode</p>
          <p>v2.1.0</p>
        </div>

        {onLogout && (
          <button type='button' className='logout-btn' onClick={onLogout}>
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
