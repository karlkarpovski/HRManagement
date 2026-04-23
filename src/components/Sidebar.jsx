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
    items: [{ label: 'Reports', id: 'reports' }],
  },
];

const Sidebar = ({ activePage, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openGroup, setOpenGroup] = useState('Employee Management');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className='sidebar-header'>
        <button className='toggle-btn' onClick={() => setIsOpen((current) => !current)}>
          MENU
        </button>
        {isOpen && <h1>HRMS</h1>}
      </div>

      <div className='sidebar-menu'>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <button className='menu-item' onClick={() => setOpenGroup((current) => (current === group.label ? '' : group.label))}>
              <span className='icon'>{group.icon}</span>
              {isOpen && <span className='label'>{group.label}</span>}
            </button>

            {isOpen && openGroup === group.label && (
              <div className='submenu'>
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
      </div>
    </aside>
  );
};

export default Sidebar;
