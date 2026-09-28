import React from 'react';
import { useToast } from '../context/ToastContext';
import { soundService } from '../services/soundService';
import { X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 380,
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const typeColor =
          toast.type === 'error'
            ? 'var(--signal-rose)'
            : toast.type === 'warning'
            ? 'var(--signal-amber)'
            : toast.type === 'success'
            ? 'var(--signal-emerald)'
            : 'var(--signal-blue)';

        return (
          <div
            key={toast.id}
            className="toast-card"
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-line)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 8px 24px rgba(18, 19, 22, 0.16)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <span
                className="status-pip"
                style={{
                  width: 6.5,
                  height: 6.5,
                  backgroundColor: typeColor,
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--ink-primary)',
                    lineHeight: 1.35,
                    wordBreak: 'break-word',
                  }}
                >
                  {toast.title}
                </span>
                {toast.description && (
                  <span
                    style={{
                      fontSize: 11.5,
                      color: 'var(--ink-muted)',
                      marginTop: 2,
                    }}
                  >
                    {toast.description}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="btn-solid"
                  style={{
                    padding: '3px 9px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    borderRadius: 3,
                    background: 'var(--ink-primary)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  dismissToast(toast.id);
                }}
                className="btn-subtle"
                style={{
                  padding: 2,
                  color: 'var(--ink-muted)',
                  cursor: 'pointer',
                }}
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
