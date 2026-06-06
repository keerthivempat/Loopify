import React, { useEffect, useRef } from 'react';

const Toast = ({ show, message, type = 'success', onClose }) => {
  const toastRef = useRef(null);

  useEffect(() => {
    if (!show || !toastRef.current) return;

    const toast = new bootstrap.Toast(toastRef.current, { delay: 3000 });
    const handleHidden = () => onClose?.();
    toastRef.current.addEventListener('hidden.bs.toast', handleHidden);
    toast.show();

    return () => {
      toastRef.current?.removeEventListener('hidden.bs.toast', handleHidden);
    };
  }, [show, message, type, onClose]);

  const bgClass = type === 'error' ? 'bg-danger' : 'bg-success';
  const icon = type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
      <div
        ref={toastRef}
        className={`toast align-items-center text-white ${bgClass} border-0`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">
            <i className={`bi ${icon} me-2`} />
            {message}
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast"
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
