import { useRef, useState } from 'react';
import { Camera, Image, Loader2, CheckCircle, X } from 'lucide-react';

interface ReceiptUploaderProps {
    isAnalyzing: boolean;
    onFileSelected: (file: File) => void;
    onCancelAnalysis?: () => void;
    disabled?: boolean;
}

export function ReceiptUploader({
    isAnalyzing,
    onFileSelected,
    onCancelAnalysis,
    disabled = false,
}: ReceiptUploaderProps) {
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setShowSuccess(false);

            // Send to parent
            onFileSelected(file);
        }

        // Reset input
        e.target.value = '';
    };

    const handleSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setPreviewUrl(null);
        }, 2000);
    };

    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setShowSuccess(false);
        if (onCancelAnalysis) {
            onCancelAnalysis();
        }
    };

    // Expose handleSuccess for parent to call
    if (typeof window !== 'undefined') {
        (window as any).__receiptUploaderSuccess = handleSuccess;
    }

    return (
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
            <h2 className="text-subtitle text-text-primary mb-4">영수증 업로드</h2>

            <div className="grid grid-cols-2 gap-3">
                {/* Camera Button */}
                <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={disabled || isAnalyzing}
                    className="
            relative flex flex-col items-center justify-center
            h-32 rounded-xl
            bg-gradient-to-br from-primary to-primary-700
            text-white
            hover:-translate-y-1 active:translate-y-0
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
            shadow-md hover:shadow-lg
          "
                >
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">카메라 촬영</span>
                </button>
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="카메라로 촬영"
                />

                {/* Gallery Button */}
                <button
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={disabled || isAnalyzing}
                    className="
            relative flex flex-col items-center justify-center
            h-32 rounded-xl
            border-2 border-primary
            text-primary bg-white
            hover:-translate-y-1 active:translate-y-0
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
            shadow-sm hover:shadow-md
          "
                >
                    <Image className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">갤러리 선택</span>
                </button>
                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="갤러리에서 선택"
                />
            </div>

            {/* Preview & Status */}
            {(previewUrl || isAnalyzing) && (
                <div className="mt-4 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {/* Thumbnail */}
                    {previewUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={previewUrl}
                                alt="영수증 미리보기"
                                className="w-full h-full object-cover"
                            />
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                            {showSuccess && (
                                <div className="absolute inset-0 bg-success/80 flex items-center justify-center animate-bounce-check">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Text */}
                    <div className="flex-1">
                        {isAnalyzing ? (
                            <>
                                <p className="text-body font-semibold text-text-primary">분석 중...</p>
                                <p className="text-caption text-text-secondary">
                                    Gemini AI가 영수증을 분석하고 있습니다
                                </p>
                            </>
                        ) : showSuccess ? (
                            <>
                                <p className="text-body font-semibold text-success">분석 완료!</p>
                                <p className="text-caption text-text-secondary">
                                    지출 내역이 추가되었습니다
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-body font-semibold text-text-primary">이미지 선택됨</p>
                                <p className="text-caption text-text-secondary">
                                    분석을 시작합니다...
                                </p>
                            </>
                        )}
                    </div>

                    {/* Delete Button */}
                    {!showSuccess && (
                        <button
                            onClick={handleRemoveImage}
                            className="
                                flex-shrink-0 w-10 h-10 
                                flex items-center justify-center
                                rounded-full bg-error/10 
                                text-error hover:bg-error/20
                                active:scale-95 transition-all
                            "
                            aria-label="이미지 삭제"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
