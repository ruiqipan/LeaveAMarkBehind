import { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div 
      className={`toast toast-${type} ${isExiting ? 'exiting' : ''}`}
      onClick={handleDismiss}
      role="alert"
    >
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

// Toast container to manage multiple toasts
export const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Haptic feedback
    if (navigator.vibrate) {
      if (type === 'success') {
        navigator.vibrate([10, 50, 10]);
      } else if (type === 'error') {
        navigator.vibrate([50, 30, 50]);
      }
    }
    
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast, ToastContainer };
};

export default Toast;
