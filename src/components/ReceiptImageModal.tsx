import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ReceiptImageModalProps {
    isOpen: boolean;
    imageUrl: string;
    storeName: string;
    date: string;
    onClose: () => void;
}

export function ReceiptImageModal({
    isOpen,
    imageUrl,
    storeName,
    date,
    onClose,
}: ReceiptImageModalProps) {
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    if (!isOpen) return null;

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.5, 0.5));
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // 파일명: 영수증_YYYYMMDD_가게명.확장자
            const dateFormatted = date.replace(/-/g, '');
            const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
            const safeStoreName = storeName.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 20);
            link.download = `영수증_${dateFormatted}_${safeStoreName}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // 폴백: 새 탭에서 열기
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full md:w-auto md:h-auto md:max-w-4xl md:max-h-[90vh] bg-black md:bg-white md:rounded-3xl md:shadow-modal overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent md:from-white md:to-white md:border-b md:border-border">
                    <div className="flex items-center gap-2">
                        <h2 className="text-body font-semibold text-white md:text-text-primary truncate max-w-[200px]">
                            {storeName}
                        </h2>
                        <span className="text-caption text-white/70 md:text-text-secondary">
                            {date}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Zoom Controls */}
                        <button
                            onClick={handleZoomOut}
                            className="p-2 rounded-full text-white md:text-text-secondary hover:bg-white/20 md:hover:bg-gray-100 transition-colors"
                            aria-label="축소"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-white md:text-text-secondary min-w-[40px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 rounded-full text-white md:text-text-secondary hover:bg-white/20 md:hover:bg-gray-100 transition-colors"
                            aria-label="확대"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>

                        {/* Download */}
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-full text-white md:text-text-secondary hover:bg-white/20 md:hover:bg-gray-100 transition-colors ml-2"
                            aria-label="다운로드"
                        >
                            <Download className="w-5 h-5" />
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-white md:text-text-secondary hover:bg-white/20 md:hover:bg-gray-100 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="w-full h-full flex items-center justify-center overflow-auto p-4 pt-16 pb-4">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                    <img
                        src={imageUrl}
                        alt={`${storeName} 영수증`}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{ transform: `scale(${scale})` }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                        draggable={false}
                    />
                </div>

                {/* Mobile Download Button (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent md:hidden">
                    <button
                        onClick={handleDownload}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-white text-text-primary font-semibold rounded-xl active:scale-95 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        다운로드
                    </button>
                </div>
            </div>
        </div>
    );
}
