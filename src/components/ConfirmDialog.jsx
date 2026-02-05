import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

const VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-600',
    confirmBtn: 'btn-danger',
  },
  warning: {
    icon: AlertCircle,
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-600',
    confirmBtn: 'btn-primary',
  },
  info: {
    icon: Info,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    confirmBtn: 'btn-primary',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
    confirmBtn: 'btn-success',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);

  const variantConfig = VARIANTS[variant] || VARIANTS.info;
  const Icon = variantConfig.icon;

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Focus the confirm button when dialog opens
      confirmBtnRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !loading) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, loading, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="modal-content max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          <div className={`flex-shrink-0 p-3 rounded-full ${variantConfig.iconBg}`}>
            <Icon className={`w-6 h-6 ${variantConfig.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={loading}
            className={variantConfig.confirmBtn}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4\" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [state, setState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const confirm = React.useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        variant: options.variant || 'danger',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          setState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });
    });
  }, []);

  const close = React.useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const DialogComponent = React.useCallback(() => (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={close}
      onConfirm={state.onConfirm}
      title={state.title}
      message={state.message}
      variant={state.variant}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
    />
  ), [state, close]);

  return { confirm, close, DialogComponent };
}

export default ConfirmDialog;
