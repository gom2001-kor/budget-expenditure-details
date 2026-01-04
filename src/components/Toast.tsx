import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

export function Toast({ toasts, onRemove }: ToastProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

interface ToastItemProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-success" />,
        error: <XCircle className="w-5 h-5 text-error" />,
        warning: <AlertTriangle className="w-5 h-5 text-warning" />,
        info: <Info className="w-5 h-5 text-primary" />,
    };

    const backgrounds = {
        success: 'bg-success/10 border-success/20',
        error: 'bg-error/10 border-error/20',
        warning: 'bg-warning/10 border-warning/20',
        info: 'bg-primary/10 border-primary/20',
    };

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        animate-slide-up backdrop-blur-sm bg-white/90
        ${backgrounds[toast.type]}
      `}
            role="alert"
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium text-text-primary">
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="닫기"
            >
                <X className="w-4 h-4 text-text-secondary" />
            </button>
        </div>
    );
}
