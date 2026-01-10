import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, X, Key, Eye, EyeOff, Check, Database, Loader2, Wallet, Lock, KeyRound, TrendingUp } from 'lucide-react';
import { testConnectionDetailed } from '../services/supabase';
import { formatCurrencyInput, extractNumber } from '../utils/formatUtils';
import { IncomeInputModal } from './IncomeInputModal';

interface SettingsProps {
    onBack: () => void;
    onResetData: () => void;
    budget: number;
    onBudgetChange: (budget: number) => void;
    apiKeyPin: string;
    onApiKeyPinChange: (pin: string) => void;
    geminiApiKey: string;
    onGeminiApiKeyChange: (key: string) => void;
    onIncomeAdd: (data: {
        date: string;
        category: string;
        amount: number;
        source: string | null;
        method: string | null;
        note: string | null;
    }) => void;
}

const DEFAULT_PIN = '1111';

type PasswordAction = 'view' | 'edit' | 'change' | 'delete' | 'reset';

export function Settings({ onBack, onResetData, budget, onBudgetChange, apiKeyPin, onApiKeyPinChange, geminiApiKey, onGeminiApiKeyChange, onIncomeAdd }: SettingsProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [budgetInput, setBudgetInput] = useState(budget > 0 ? budget.toLocaleString('ko-KR') : '');
    const [isBudgetSaved, setIsBudgetSaved] = useState(false);
    const [isApiKeyEditable, setIsApiKeyEditable] = useState(false);

    // 수입 입력 모달 state
    const [showIncomeModal, setShowIncomeModal] = useState(false);

    // 비밀번호 관련 state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordAction, setPasswordAction] = useState<PasswordAction>('view');
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePasswordError, setChangePasswordError] = useState('');
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    // DB 테스트 관련 state
    const [dbTestLoading, setDbTestLoading] = useState(false);
    const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Budget 동기화
    useEffect(() => {
        setBudgetInput(budget > 0 ? budget.toLocaleString('ko-KR') : '');
    }, [budget]);

    // geminiApiKey props 동기화
    useEffect(() => {
        setApiKey(geminiApiKey || '');
    }, [geminiApiKey]);

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            onGeminiApiKeyChange(apiKey.trim());
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const handleClearApiKey = () => {
        // 비밀번호 확인 후 삭제
        requestPasswordVerification('delete');
    };

    const performApiKeyDelete = () => {
        onGeminiApiKeyChange('');
        setApiKey('');
        setShowApiKey(false);
        setIsApiKeyEditable(false);
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

    // 비밀번호 가져오기 (props에서, 없으면 기본값)
    const getStoredPin = () => {
        return apiKeyPin || DEFAULT_PIN;
    };

    // 비밀번호 확인 요청
    const requestPasswordVerification = (action: PasswordAction) => {
        setPasswordAction(action);
        setPasswordInput('');
        setPasswordError('');
        setShowPasswordModal(true);
    };

    // 비밀번호 확인 처리
    const handlePasswordSubmit = () => {
        const storedPin = getStoredPin();
        if (passwordInput === storedPin) {
            setShowPasswordModal(false);
            setPasswordInput('');
            setPasswordError('');

            if (passwordAction === 'view') {
                setShowApiKey(true);
            } else if (passwordAction === 'edit') {
                setIsApiKeyEditable(true);
                setShowApiKey(true);
            } else if (passwordAction === 'change') {
                setShowChangePasswordModal(true);
            } else if (passwordAction === 'delete') {
                performApiKeyDelete();
            } else if (passwordAction === 'reset') {
                setShowConfirm(true);
            }
        } else {
            setPasswordError('비밀번호가 일치하지 않습니다.');
        }
    };

    // 비밀번호 변경 처리
    const handleChangePassword = () => {
        setChangePasswordError('');

        // 현재 비밀번호 확인
        if (currentPassword !== getStoredPin()) {
            setChangePasswordError('현재 비밀번호가 일치하지 않습니다.');
            return;
        }

        // 새 비밀번호 유효성 검사
        if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) {
            setChangePasswordError('비밀번호는 4자리 숫자여야 합니다.');
            return;
        }

        // 확인 비밀번호 일치 확인
        if (newPassword !== confirmPassword) {
            setChangePasswordError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        // 비밀번호 저장 (Supabase로)
        onApiKeyPinChange(newPassword);
        setIsPasswordChanged(true);
        setTimeout(() => {
            setIsPasswordChanged(false);
            setShowChangePasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }, 1500);
    };

    // API 키 보기 버튼 클릭 핸들러
    const handleEyeClick = () => {
        if (showApiKey) {
            setShowApiKey(false);
            setIsApiKeyEditable(false);
        } else {
            requestPasswordVerification('view');
        }
    };

    // API 키 입력 필드 포커스 핸들러
    const handleApiKeyFocus = () => {
        if (!isApiKeyEditable && apiKey) {
            requestPasswordVerification('edit');
        } else if (!apiKey) {
            setIsApiKeyEditable(true);
            setShowApiKey(true);
        }
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
                                            if (isApiKeyEditable) {
                                                setApiKey(e.target.value);
                                            }
                                        }}
                                        onFocus={handleApiKeyFocus}
                                        readOnly={!isApiKeyEditable && !!apiKey}
                                        placeholder="API 키를 입력하세요"
                                        className={`
                                            w-full h-12 px-4 pr-12
                                            border-2 border-border rounded-xl
                                            text-body text-text-primary
                                            placeholder:text-text-secondary/50
                                            focus:border-primary focus:outline-none
                                            transition-colors
                                            ${!isApiKeyEditable && apiKey ? 'cursor-pointer bg-gray-50' : ''}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleEyeClick}
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
                                        disabled={!apiKey.trim() || !isApiKeyEditable}
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

                                {/* 비밀번호 변경 버튼 */}
                                <button
                                    onClick={() => requestPasswordVerification('change')}
                                    className="w-full mt-3 h-10 rounded-xl font-semibold text-sm border-2 border-primary/30 text-primary hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    API 키 비밀번호 변경
                                </button>

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

                {/* Income Entry Section */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            수입 내역 입력
                        </h2>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body font-semibold text-text-primary mb-1">수입 내역 관리</p>
                                <p className="text-caption text-text-secondary mb-3">
                                    수입 내역을 입력하여 관리합니다.
                                </p>

                                <button
                                    onClick={() => setShowIncomeModal(true)}
                                    className="
                                        w-full h-10 rounded-xl font-semibold text-sm
                                        flex items-center justify-center gap-2
                                        transition-all active:scale-95
                                        bg-success text-white hover:bg-green-600
                                    "
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    입력
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
                            onClick={() => requestPasswordVerification('reset')}
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
                                        모든 지출 및 수입 내역이 삭제됩니다
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
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-modal p-6 animate-scale-in"
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
                            모든 지출 및 수입 내역이 삭제됩니다.
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

            {/* Password Verification Modal */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in"
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-modal p-6 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>

                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>

                        <h2 className="text-subtitle text-center mb-2">
                            비밀번호 확인
                        </h2>

                        <p className="text-body text-text-secondary text-center mb-4">
                            {passwordAction === 'reset' ? '데이터 초기화' : `API 키 ${passwordAction === 'view' ? '보기' : passwordAction === 'edit' ? '수정' : passwordAction === 'delete' ? '삭제' : '비밀번호 변경'}`}을(를) 위해<br />4자리 비밀번호를 입력하세요.
                        </p>

                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={passwordInput}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setPasswordInput(val);
                                setPasswordError('');
                            }}
                            placeholder="••••"
                            className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                            autoFocus
                        />

                        {passwordError && (
                            <p className="text-error text-sm text-center mt-2">{passwordError}</p>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={passwordInput.length !== 4}
                                className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in"
                    onClick={() => setShowChangePasswordModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-modal p-6 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowChangePasswordModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>

                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <KeyRound className="w-8 h-8 text-primary" />
                        </div>

                        <h2 className="text-subtitle text-center mb-4">
                            비밀번호 변경
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-text-secondary mb-1 block">현재 비밀번호</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={currentPassword}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setCurrentPassword(val);
                                        setChangePasswordError('');
                                    }}
                                    placeholder="••••"
                                    className="w-full h-12 text-center text-xl tracking-[0.5em] font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-text-secondary mb-1 block">새 비밀번호 (4자리 숫자)</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={newPassword}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setNewPassword(val);
                                        setChangePasswordError('');
                                    }}
                                    placeholder="••••"
                                    className="w-full h-12 text-center text-xl tracking-[0.5em] font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-text-secondary mb-1 block">새 비밀번호 확인</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setConfirmPassword(val);
                                        setChangePasswordError('');
                                    }}
                                    placeholder="••••"
                                    className="w-full h-12 text-center text-xl tracking-[0.5em] font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {changePasswordError && (
                            <p className="text-error text-sm text-center mt-3">{changePasswordError}</p>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowChangePasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setChangePasswordError('');
                                }}
                                className="flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={currentPassword.length !== 4 || newPassword.length !== 4 || confirmPassword.length !== 4}
                                className={`flex-1 h-12 font-semibold rounded-xl active:scale-95 transition-all ${isPasswordChanged
                                    ? 'bg-success text-white'
                                    : 'bg-primary text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {isPasswordChanged ? (
                                    <>
                                        <Check className="w-4 h-4 inline mr-1" />
                                        변경됨
                                    </>
                                ) : (
                                    '변경'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Income Input Modal */}
            <IncomeInputModal
                isOpen={showIncomeModal}
                onSave={(data) => {
                    onIncomeAdd(data);
                    setShowIncomeModal(false);
                }}
                onClose={() => setShowIncomeModal(false)}
            />
        </div>
    );
}
