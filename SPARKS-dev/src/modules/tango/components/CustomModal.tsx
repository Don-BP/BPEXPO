// ========= START: bp-tango-dev/src/components/CustomModal.js (NEW FILE) =========
import React from 'react';

function CustomModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default CustomModal;
// ========= END: bp-tango-dev/src/components/CustomModal.js (NEW FILE) =========