import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, X, Key, Eye, EyeOff, Check, Database, Loader2, Wallet } from 'lucide-react';
import { testConnectionDetailed } from '../services/supabase';
import { formatCurrencyInput, extractNumber } from '../utils/formatUtils';

interface SettingsProps {
    onBack: () => void;
    onResetData: () => void;
    budget: number;
    onBudgetChange: (budget: number) => void;
}

const GEMINI_API_KEY_STORAGE_KEY = 'gemini-api-key';

export function Settings({ onBack, onResetData, budget, onBudgetChange }: SettingsProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [budgetInput, setBudgetInput] = useState(budget > 0 ? budget.toLocaleString('ko-KR') : '');
    const [isBudgetSaved, setIsBudgetSaved] = useState(false);

    // DB 테스트 관련 state
    const [dbTestLoading, setDbTestLoading] = useState(false);
    const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Budget 동기화
    useEffect(() => {
        setBudgetInput(budget > 0 ? budget.toLocaleString('ko-KR') : '');
    }, [budget]);

    // Load saved API key on mount
    useEffect(() => {
        const savedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey.trim());
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const handleClearApiKey = () => {
        localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
        setApiKey('');
    };

    const handleReset = () => {
        onResetData();
        setShowConfirm(false);
    };

    // DB 연결 테스트
    const handleDbTest = async () => {
        setDbTestLoading(true);
        setDbTestResult(null);

        try {
            const result = await testConnectionDetailed();
            setDbTestResult(result);
            console.log('DB Test Result:', result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
            setDbTestResult({ success: false, message: errorMessage });
            console.error('DB Test Error:', err);
        } finally {
            setDbTestLoading(false);
        }
    };

    // Mask API key for display
    const getMaskedKey = () => {
        if (!apiKey) return '';
        if (apiKey.length <= 8) return '••••••••';
        return apiKey.slice(0, 4) + '••••••••' + apiKey.slice(-4);
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
                {/* API Key Section */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            API 설정
                        </h2>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Key className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body font-semibold text-text-primary mb-1">Gemini API 키</p>
                                <p className="text-caption text-text-secondary mb-3">
                                    영수증 분석을 위해 Google AI Studio에서 발급받은 API 키를 입력하세요.
                                </p>

                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={showApiKey ? apiKey : (apiKey ? getMaskedKey() : '')}
                                        onChange={(e) => {
                                            if (showApiKey) {
                                                setApiKey(e.target.value);
                                            }
                                        }}
                                        onFocus={() => setShowApiKey(true)}
                                        placeholder="API 키를 입력하세요"
                                        className="
                                            w-full h-12 px-4 pr-12
                                            border-2 border-border rounded-xl
                                            text-body text-text-primary
                                            placeholder:text-text-secondary/50
                                            focus:border-primary focus:outline-none
                                            transition-colors
                                        "
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors"
                                        aria-label={showApiKey ? 'API 키 숨기기' : 'API 키 보기'}
                                    >
                                        {showApiKey ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleSaveApiKey}
                                        disabled={!apiKey.trim()}
                                        className={`
                                            flex-1 h-10 rounded-xl font-semibold text-sm
                                            flex items-center justify-center gap-2
                                            transition-all active:scale-95
                                            ${isSaved
                                                ? 'bg-success text-white'
                                                : 'bg-primary text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {isSaved ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                저장됨
                                            </>
                                        ) : (
                                            '저장'
                                        )}
                                    </button>
                                    {apiKey && (
                                        <button
                                            onClick={handleClearApiKey}
                                            className="h-10 px-4 rounded-xl font-semibold text-sm border-2 border-gray-200 text-text-secondary hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>

                                <a
                                    href="https://aistudio.google.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-caption text-primary hover:underline"
                                >
                                    Google AI Studio에서 API 키 발급받기 →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DB Connection Test Section */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            데이터베이스 연결
                        </h2>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Database className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body font-semibold text-text-primary mb-1">Supabase 연결 테스트</p>
                                <p className="text-caption text-text-secondary mb-3">
                                    PC와 모바일 간 데이터 동기화가 안 되면 DB 연결 상태를 확인하세요.
                                </p>

                                <button
                                    onClick={handleDbTest}
                                    disabled={dbTestLoading}
                                    className="
                                        w-full h-12 rounded-xl font-semibold text-sm
                                        flex items-center justify-center gap-2
                                        bg-success text-white hover:bg-green-600
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all active:scale-95
                                    "
                                >
                                    {dbTestLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            테스트 중...
                                        </>
                                    ) : (
                                        <>
                                            <Database className="w-4 h-4" />
                                            DB 연결 테스트
                                        </>
                                    )}
                                </button>

                                {/* Test Result */}
                                {dbTestResult && (
                                    <div className={`
                                        mt-3 p-3 rounded-xl text-sm
                                        ${dbTestResult.success
                                            ? 'bg-success/10 text-success border border-success/20'
                                            : 'bg-error/10 text-error border border-error/20'
                                        }
                                    `}>
                                        <p className="font-semibold mb-1">
                                            {dbTestResult.success ? '✅ 연결 성공' : '❌ 연결 실패'}
                                        </p>
                                        <p className="text-xs opacity-80 break-words">
                                            {dbTestResult.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget Settings Section */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            예산 설정
                        </h2>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body font-semibold text-text-primary mb-1">총 예산 금액</p>
                                <p className="text-caption text-text-secondary mb-3">
                                    월별 또는 기간별로 사용할 총 예산을 설정하세요.
                                </p>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-primary">₩</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={budgetInput}
                                        onChange={(e) => {
                                            const formatted = formatCurrencyInput(e.target.value);
                                            setBudgetInput(formatted);
                                        }}
                                        placeholder="0"
                                        className="
                                            w-full h-12 pl-10 pr-4
                                            border-2 border-border rounded-xl
                                            text-xl font-bold text-text-primary tabular-nums
                                            placeholder:text-text-secondary/50
                                            focus:border-primary focus:outline-none
                                            transition-colors
                                        "
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        const newBudget = extractNumber(budgetInput);
                                        onBudgetChange(newBudget);
                                        setIsBudgetSaved(true);
                                        setTimeout(() => setIsBudgetSaved(false), 2000);
                                    }}
                                    className={`
                                        w-full h-10 mt-3 rounded-xl font-semibold text-sm
                                        flex items-center justify-center gap-2
                                        transition-all active:scale-95
                                        ${isBudgetSaved
                                            ? 'bg-success text-white'
                                            : 'bg-primary text-white hover:bg-primary-700'
                                        }
                                    `}
                                >
                                    {isBudgetSaved ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            저장됨
                                        </>
                                    ) : (
                                        '예산 저장'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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

// Export the storage key for use in other files
export { GEMINI_API_KEY_STORAGE_KEY };
