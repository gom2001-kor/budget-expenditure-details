import { AlertCircle, X } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'error' | 'warning' | 'info';
}

export function AlertModal({
    isOpen,
    title,
    message,
    onClose,
    type = 'error',
}: AlertModalProps) {
    if (!isOpen) return null;

    const iconColors = {
        error: 'text-error',
        warning: 'text-warning',
        info: 'text-primary',
    };

    const bgColors = {
        error: 'bg-error/10',
        warning: 'bg-warning/10',
        info: 'bg-primary/10',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm bg-white rounded-3xl shadow-modal p-6 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="닫기"
                >
                    <X className="w-5 h-5 text-text-secondary" />
                </button>

                {/* Icon */}
                <div className={`mx-auto w-16 h-16 rounded-full ${bgColors[type]} flex items-center justify-center mb-4 animate-shake`}>
                    <AlertCircle className={`w-8 h-8 ${iconColors[type]}`} />
                </div>

                {/* Title */}
                <h2 className="text-subtitle text-center mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-body text-text-secondary text-center mb-6">
                    {message}
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all btn-press"
                >
                    확인
                </button>
            </div>
        </div>
    );
}
