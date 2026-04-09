import React from 'react';
import '../styles/components.css';

/**
 * Reusable Button Component
 * @param {string} label - Button text
 * @param {function} onClick - Click handler
 * @param {string} variant - Button style (primary, secondary, danger)
 * @param {boolean} disabled - Disable button
 */
const Button = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = ''
}) => {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
