import { FileText, X } from 'lucide-react';

export type PdfOrientation = 'portrait' | 'landscape';

interface PdfOrientationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (orientation: PdfOrientation) => void;
    title?: string;
}

export function PdfOrientationModal({
    isOpen,
    onClose,
    onSelect,
    title = 'PDF 방향 선택',
}: PdfOrientationModalProps) {
    if (!isOpen) return null;

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
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-subtitle text-center mb-2">
                    {title}
                </h2>

                {/* Description */}
                <p className="text-body text-text-secondary text-center mb-6">
                    PDF 문서의 방향을 선택하세요.
                </p>

                {/* Orientation Options */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => onSelect('portrait')}
                        className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
                    >
                        <div className="w-8 h-12 border-2 border-primary rounded bg-primary/10" />
                        <span className="text-sm font-semibold text-text-primary">세로모드</span>
                    </button>
                    <button
                        onClick={() => onSelect('landscape')}
                        className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
                    >
                        <div className="w-12 h-8 border-2 border-primary rounded bg-primary/10" />
                        <span className="text-sm font-semibold text-text-primary">가로모드</span>
                    </button>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="w-full h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                >
                    취소
                </button>
            </div>
        </div>
    );
}
