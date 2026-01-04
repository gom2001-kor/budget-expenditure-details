import { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, X } from 'lucide-react';

interface SettingsProps {
    onBack: () => void;
    onResetData: () => void;
}

export function Settings({ onBack, onResetData }: SettingsProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleReset = () => {
        onResetData();
        setShowConfirm(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="뒤로가기"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-primary" />
                    </button>
                    <h1 className="text-subtitle text-text-primary">설정</h1>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Data Management Section */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            데이터 관리
                        </h2>
                    </div>

                    <div className="p-4">
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="
                w-full flex items-center justify-between
                px-4 py-4 rounded-xl
                border-2 border-error/30 bg-error/5
                hover:bg-error/10 active:scale-[0.98]
                transition-all
              "
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-error" />
                                </div>
                                <div className="text-left">
                                    <p className="text-body font-semibold text-error">모든 데이터 초기화</p>
                                    <p className="text-caption text-text-secondary">
                                        모든 지출 내역이 삭제됩니다
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* App Info */}
                <div className="bg-white rounded-2xl shadow-card p-4">
                    <div className="text-center text-caption text-text-secondary">
                        <p>지출 관리 앱 v1.0.0</p>
                        <p className="mt-1">Powered by Gemini AI & Supabase</p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-3xl shadow-modal p-6 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>

                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-error" />
                        </div>

                        {/* Title */}
                        <h2 className="text-subtitle text-center mb-2">
                            정말 삭제하시겠습니까?
                        </h2>

                        {/* Message */}
                        <p className="text-body text-text-secondary text-center mb-6">
                            모든 지출 내역이 삭제됩니다.
                            <br />
                            이 작업은 되돌릴 수 없습니다.
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all btn-press"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 h-12 bg-error text-white font-semibold rounded-xl hover:bg-red-600 active:scale-95 transition-all btn-press"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
