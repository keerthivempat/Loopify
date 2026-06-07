import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ show, message, type = 'success', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, duration);
      return () => clearTimeout(t);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className={`lp-toast lp-toast-${type}`} role="alert">
      <div className="lp-toast-icon">
        {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      </div>
      <span className="lp-toast-msg">{message}</span>
      <button className="lp-toast-close" onClick={onClose} aria-label="Close">
        <X size={15} />
      </button>
    </div>
  );
};

export default Toast;
