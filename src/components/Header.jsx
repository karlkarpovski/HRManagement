import React from 'react';
import '../styles/components.css';

/**
 * Header Component - Page header with title and actions
 */
const Header = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && (
        <div className="header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Header;
