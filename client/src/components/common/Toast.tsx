import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastMessage } from '../../types';
import { cn } from '../../utils/cn';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const toastVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.3 },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2 },
  },
};

const toastLeftVariants = {
  hidden: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3 },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.2 },
  },
};

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export function Toast({ toast, onDismiss, position = 'top-right' }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = toastIcons[toast.type];
  const colorClass = toastColors[toast.type];
  const isLeft = position.includes('left');

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [toast.id, onDismiss]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [handleDismiss]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={toast.id}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={isLeft ? toastLeftVariants : toastVariants}
          className={cn(
            'fixed z-50 w-full max-w-sm p-4 rounded-xl shadow-lg',
            colorClass,
            position === 'top-left' && 'top-6 left-6',
            position === 'top-right' && 'top-6 right-6',
            position === 'bottom-left' && 'bottom-6 left-6',
            position === 'bottom-right' && 'bottom-6 right-6',
          )}
        >
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {toast.title && (
                <h3 className="font-semibold text-white mb-1">{toast.title}</h3>
              )}
              <p className="text-sm text-white/90">{toast.message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast container component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          position={position}
        />
      ))}
    </>
  );
}

// Hook for toast management
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastMessage['type'], message: string, title?: string) => {
      const id = String(++toastId);
      setToasts((prev) => [
        ...prev,
        { id, type, message, title },
      ]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string) => addToast('success', message, title),
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => addToast('error', message, title),
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => addToast('warning', message, title),
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => addToast('info', message, title),
    [addToast]
  );

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
}
