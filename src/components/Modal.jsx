import React from 'react';
import '../styles/components.css';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Modal visibility state
 * @param {function} onClose - Handler to close modal
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
