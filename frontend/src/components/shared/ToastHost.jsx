import React from 'react';
import { useUiStore } from '../../store/uiStore';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function ToastHost() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none">
      {toasts.map((toast) => {
        // Icon selector
        let Icon = Info;
        let bgClass = 'bg-indigo-600';

        switch (toast.type) {
          case 'success':
            Icon = CheckCircle;
            bgClass = 'bg-emerald-600';
            break;
          case 'error':
            Icon = AlertCircle;
            bgClass = 'bg-red-600';
            break;
          case 'warning':
            Icon = AlertTriangle;
            bgClass = 'bg-amber-600';
            break;
          case 'info':
          default:
            Icon = Info;
            bgClass = 'bg-indigo-600';
            break;
        }

        return (
          <div
            key={toast.id}
            className={`custom-toast pointer-events-auto shadow-2xl animate-slide-in ${bgClass}`}
            style={{
              animation: 'toast-fade-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards'
            }}
          >
            <div className="shrink-0 mt-0.5">
              <Icon size={18} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="font-semibold text-sm leading-tight mb-0.5">{toast.title}</h4>}
              {toast.message && <p className="text-xs opacity-90 leading-normal">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toast-fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
