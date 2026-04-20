import { useState, useCallback, createContext } from 'react';
import { m as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

/* eslint-disable-next-line react-refresh/only-export-components */
export const ToastContext = createContext(null);

/**
 * ToastProvider — global toast notification system.
 * Demonstrates Context API for cross-component communication.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container — fixed to bottom-right */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <Motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}
            >
              {toast.type === 'error' ? (
                <XCircle className="icon-sm" />
              ) : (
                <CheckCircle2 className="icon-sm" />
              )}
              <span className="toast-message">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="toast-close">
                <X className="icon-xs" />
              </button>
            </Motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
