import { useState, useRef } from 'react';
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleResetZoom = () => {
        setScale(1);
        // 스크롤 위치 초기화
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
            scrollContainerRef.current.scrollLeft = 0;
        }
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
                className="relative w-full h-full bg-black flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-body font-semibold text-white truncate max-w-[150px] sm:max-w-[250px]">
                            {storeName}
                        </h2>
                        <span className="text-caption text-white/70 flex-shrink-0">
                            {date}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Zoom Controls */}
                        <button
                            onClick={handleZoomOut}
                            className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                            aria-label="축소"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="px-2 py-1 rounded-lg text-sm text-white hover:bg-white/20 transition-colors min-w-[50px] text-center"
                            aria-label="초기화"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                            aria-label="확대"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>

                        <div className="w-px h-6 bg-white/20 mx-1" />

                        {/* Download */}
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                            aria-label="다운로드"
                        >
                            <Download className="w-5 h-5" />
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Image Container - Scrollable */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-auto"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <div
                        className="min-h-full flex items-start justify-center p-4"
                        style={{
                            minWidth: scale > 1 ? `${scale * 100}%` : '100%',
                        }}
                    >
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt={`${storeName} 영수증`}
                            className="max-w-none transition-all duration-200"
                            style={{
                                width: `${scale * 100}%`,
                                maxWidth: 'none',
                            }}
                            onLoad={() => setIsLoading(false)}
                            onError={() => setIsLoading(false)}
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Mobile Download Button (Bottom) */}
                <div className="flex-shrink-0 p-4 bg-black/90 border-t border-white/10 md:hidden safe-bottom">
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

