import React from 'react';
import '../styles/components.css';

const Button = ({ label, onClick, variant = 'primary', type = 'button', disabled = false }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>
      {label}
    </button>
  );
};

export default Button;
