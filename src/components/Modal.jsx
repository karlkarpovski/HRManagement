import React from 'react';
import '../styles/components.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={(event) => event.stopPropagation()}>
        <div className='modal-header'>
          <h2>{title}</h2>
          <button className='modal-close' onClick={onClose}>
            X
          </button>
        </div>
        <div className='modal-body'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
