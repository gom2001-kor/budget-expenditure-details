import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { DateRangePicker } from './components/DateRangePicker';
import { ReceiptUploader } from './components/ReceiptUploader';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseEditModal } from './components/ExpenseEditModal';
import { ManualExpenseModal } from './components/ManualExpenseModal';
import { SearchBar } from './components/SearchBar';
import { AdvancedSearchModal, emptyFilters, type AdvancedFilters } from './components/AdvancedSearchModal';
import { AlertModal } from './components/AlertModal';
import { Toast } from './components/Toast';
import { Settings } from './components/Settings';
import { ReceiptImageModal } from './components/ReceiptImageModal';
import { IncomeInputModal } from './components/IncomeInputModal';
import { IncomeEditModal } from './components/IncomeEditModal';
import { IncomeList } from './components/IncomeList';

// Services
import { initializeSupabase, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, getUserSettings, updateUserSettings } from './services/supabase';
import { analyzeReceipt } from './services/gemini';
import { uploadImage } from './services/storage';

// Hooks
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';
import { useToast } from './hooks/useToast';

// Utils
import { isDateInRange, formatDateRangeKorean, toISODateString, parseLocalDate } from './utils/dateUtils';
import { exportToPdf, exportIncomeToPdf } from './utils/pdfExport';

// Types
import type { Expense, Income, DateRange } from './types';

function App() {
    // App state
    const [showSettings, setShowSettings] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [supabaseInitialized, setSupabaseInitialized] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Settings state (from Supabase)
    const [budget, setBudget] = useState(0);
    const [apiKeyPin, setApiKeyPin] = useState('1111'); // 기본값
    const [geminiApiKey, setGeminiApiKey] = useState(''); // Gemini API 키
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: null,
        endDate: null,
    });

    // Edit modal state
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Receipt image modal state
    const [viewingReceipt, setViewingReceipt] = useState<Expense | null>(null);

    // Alert state
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    // New expense animation
    const [newExpenseId, setNewExpenseId] = useState<string | null>(null);

    // Manual expense modal state
    const [showManualExpenseModal, setShowManualExpenseModal] = useState(false);

    // Search state
    const [basicSearch, setBasicSearch] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyFilters);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // Tab state for expense/income toggle
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

    // Income modal states
    const [showIncomeInputModal, setShowIncomeInputModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [newIncomeId, setNewIncomeId] = useState<string | null>(null);

    // Toast
    const { toasts, success, error: showError, removeToast } = useToast();

    // Initialize Supabase
    useEffect(() => {
        try {
            initializeSupabase(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
            setSupabaseInitialized(true);
        } catch (err) {
            console.error('Supabase init error:', err);
            showError('Supabase 연결에 실패했습니다.');
        }
    }, []);

    // Load settings from Supabase
    useEffect(() => {
        const loadSettings = async () => {
            if (!supabaseInitialized) return;

            try {
                const settings = await getUserSettings();
                console.log('Loaded settings from Supabase:', settings);
                if (settings) {
                    setBudget(settings.budget || 0);
                    setApiKeyPin(settings.api_key_pin || '1111');
                    setGeminiApiKey(settings.gemini_api_key || '');
                    setDateRange({
                        // 타임존 보정된 파싱 사용
                        startDate: settings.start_date ? parseLocalDate(settings.start_date) : null,
                        endDate: settings.end_date ? parseLocalDate(settings.end_date) : null,
                    });
                }
            } catch (err) {
                console.error('Load settings error:', err);
            } finally {
                setSettingsLoading(false);
            }
        };

        loadSettings();
    }, [supabaseInitialized]);

    // Expenses hook
    const {
        expenses,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
        clearAll,
        totalSpent,
    } = useExpenses(supabaseInitialized);

    // Incomes hook
    const {
        incomes,
        loading: incomesLoading,
        addIncome,
        updateIncome,
        deleteIncome,
        totalIncome,
    } = useIncomes(supabaseInitialized);

    // Filter expenses by date range, search, and sort by date/time descending
    const filteredExpenses = expenses
        .filter((expense) => {
            // Date range filter (from header)
            if (dateRange.startDate && dateRange.endDate) {
                if (!isDateInRange(expense.date, dateRange.startDate, dateRange.endDate)) {
                    return false;
                }
            }

            // Basic search filter (store_name, address, reason)
            if (basicSearch.trim()) {
                const searchLower = basicSearch.toLowerCase();
                const matchesStore = expense.store_name.toLowerCase().includes(searchLower);
                const matchesAddress = expense.address?.toLowerCase().includes(searchLower) || false;
                const matchesReason = expense.reason?.toLowerCase().includes(searchLower) || false;
                if (!matchesStore && !matchesAddress && !matchesReason) {
                    return false;
                }
            }

            // Advanced filters
            // Date range from advanced search
            if (advancedFilters.dateFrom && expense.date < advancedFilters.dateFrom) {
                return false;
            }
            if (advancedFilters.dateTo && expense.date > advancedFilters.dateTo) {
                return false;
            }

            // Category filter
            if (advancedFilters.category && expense.category !== advancedFilters.category) {
                return false;
            }

            // Amount range filter
            if (advancedFilters.minAmount) {
                const minAmt = parseInt(advancedFilters.minAmount.replace(/,/g, ''), 10);
                if (expense.amount < minAmt) return false;
            }
            if (advancedFilters.maxAmount) {
                const maxAmt = parseInt(advancedFilters.maxAmount.replace(/,/g, ''), 10);
                if (expense.amount > maxAmt) return false;
            }

            // Store name filter (from advanced)
            if (advancedFilters.storeName && !expense.store_name.toLowerCase().includes(advancedFilters.storeName.toLowerCase())) {
                return false;
            }

            // Reason filter (from advanced)
            if (advancedFilters.reason && !(expense.reason?.toLowerCase().includes(advancedFilters.reason.toLowerCase()))) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            // Sort by date descending
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            // If same date, sort by time descending
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeB.localeCompare(timeA);
        });

    // Check if any advanced filter is active
    const hasActiveAdvancedFilters = Object.values(advancedFilters).some(v => v !== '');

    // 수입 내역 날짜순 내림차순 정렬
    const sortedIncomes = [...incomes].sort((a, b) => b.date.localeCompare(a.date));

    // Handle date range change with Supabase sync
    const handleDateRangeChange = async (start: Date | null, end: Date | null) => {
        setDateRange({ startDate: start, endDate: end });

        // Sync to Supabase (로컬 타임존 기준 날짜 저장)
        const result = await updateUserSettings({
            budget,
            start_date: start ? toISODateString(start) : null,
            end_date: end ? toISODateString(end) : null,
        });

        if (!result.success) {
            console.error('Save date range error:', result.error);
            showError('설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } else {
            console.log('Date range saved successfully');
        }
    };

    // Handle budget change with Supabase sync
    const handleBudgetChange = async (newBudget: number) => {
        setBudget(newBudget);

        // Sync to Supabase (로컬 타임존 기준 날짜 저장)
        const result = await updateUserSettings({
            budget: newBudget,
            start_date: dateRange.startDate ? toISODateString(dateRange.startDate) : null,
            end_date: dateRange.endDate ? toISODateString(dateRange.endDate) : null,
        });

        if (!result.success) {
            console.error('Save budget error:', result.error);
            showError('설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } else {
            console.log('Budget saved successfully:', newBudget);
        }
    };

    // Handle receipt upload
    const handleReceiptUpload = useCallback(async (file: File) => {
        setIsAnalyzing(true);

        try {
            // 1. Analyze receipt with Gemini
            const analyzed = await analyzeReceipt(file, geminiApiKey);

            // 2. Check date range validation
            if (!isDateInRange(analyzed.date, dateRange.startDate, dateRange.endDate)) {
                setAlertState({
                    isOpen: true,
                    title: '기간 외 영수증',
                    message: `설정된 기간(${formatDateRangeKorean(dateRange.startDate, dateRange.endDate)})을 벗어난 영수증입니다.`,
                });
                setIsAnalyzing(false);
                return;
            }

            // 3. Upload image to Supabase Storage
            let imageUrl = null;
            try {
                imageUrl = await uploadImage(file);
            } catch (err) {
                console.warn('Image upload failed, continuing without image:', err);
            }

            // 4. Save to database
            const newExpense = await addExpense({
                date: analyzed.date,
                time: analyzed.time,
                store_name: analyzed.store_name,
                address: analyzed.address,
                amount: analyzed.amount,
                category: '기타',
                reason: null,
                image_url: imageUrl,
                user_id: 'default_user',
            });

            setNewExpenseId(newExpense.id);
            setTimeout(() => setNewExpenseId(null), 3000);

            success('지출이 추가되었습니다!');

            // Trigger success animation in uploader
            if ((window as any).__receiptUploaderSuccess) {
                (window as any).__receiptUploaderSuccess();
            }
        } catch (err) {
            console.error('Receipt processing error:', err);
            showError(err instanceof Error ? err.message : '영수증 처리에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [dateRange, addExpense, success, showError]);

    // Handle manual expense add
    const handleManualExpenseAdd = useCallback(async (data: {
        date: string;
        time: string | null;
        store_name: string;
        address: string | null;
        amount: number;
        category: string;
        reason: string | null;
        imageFile: File | null;
    }) => {
        // Date range validation
        if (!isDateInRange(data.date, dateRange.startDate, dateRange.endDate)) {
            setShowManualExpenseModal(false);
            setAlertState({
                isOpen: true,
                title: '기간 외 날짜',
                message: `설정된 기간(${formatDateRangeKorean(dateRange.startDate, dateRange.endDate)})을 벗어난 날짜입니다.`,
            });
            return;
        }

        try {
            // Upload image if provided
            let imageUrl = null;
            if (data.imageFile) {
                try {
                    imageUrl = await uploadImage(data.imageFile);
                } catch (err) {
                    console.warn('Image upload failed:', err);
                }
            }

            // Save to database
            const newExpense = await addExpense({
                date: data.date,
                time: data.time,
                store_name: data.store_name,
                address: data.address,
                amount: data.amount,
                category: data.category,
                reason: data.reason,
                image_url: imageUrl,
                user_id: 'default_user',
            });

            setNewExpenseId(newExpense.id);
            setTimeout(() => setNewExpenseId(null), 3000);

            success('지출이 추가되었습니다!');
            setShowManualExpenseModal(false);
        } catch (err) {
            console.error('Manual expense add error:', err);
            showError(err instanceof Error ? err.message : '지출 추가에 실패했습니다.');
        }
    }, [dateRange, addExpense, success, showError]);

    // Handle expense edit
    const handleEditSave = async (id: string, updates: Partial<Expense>) => {
        // Date range validation for edited date
        if (updates.date && !isDateInRange(updates.date, dateRange.startDate, dateRange.endDate)) {
            setAlertState({
                isOpen: true,
                title: '기간 외 날짜',
                message: `설정된 기간(${formatDateRangeKorean(dateRange.startDate, dateRange.endDate)})을 벗어난 날짜입니다.`,
            });
            return;
        }

        try {
            await updateExpense(id, updates);
            success('수정되었습니다.');
        } catch (err) {
            showError('수정에 실패했습니다.');
        }
    };

    // Handle expense delete
    const handleDelete = async (id: string) => {
        try {
            await deleteExpense(id);
            success('삭제되었습니다.');
        } catch (err) {
            showError('삭제에 실패했습니다.');
        }
    };

    // Handle view receipt
    const handleViewReceipt = (expense: Expense) => {
        if (expense.image_url) {
            setViewingReceipt(expense);
        }
    };

    // Handle data reset
    const handleResetData = async () => {
        try {
            await clearAll();
            setBudget(0);
            setDateRange({ startDate: null, endDate: null });

            // Reset settings in Supabase
            const result = await updateUserSettings({
                budget: 0,
                start_date: null,
                end_date: null,
            });

            if (!result.success) {
                console.warn('Settings reset warning:', result.error);
            }

            success('모든 데이터가 초기화되었습니다.');
            setShowSettings(false);
        } catch (err) {
            showError('초기화에 실패했습니다.');
        }
    };

    // Handle PDF export
    const handleExportPdf = async () => {
        try {
            await exportToPdf(filteredExpenses, dateRange, budget);
            success('PDF가 다운로드되었습니다.');
        } catch (err) {
            showError('PDF 생성에 실패했습니다.');
        }
    };

    // Handle API Key PIN change
    const handleApiKeyPinChange = async (newPin: string) => {
        setApiKeyPin(newPin);
        try {
            await updateUserSettings({
                budget,
                start_date: dateRange.startDate ? toISODateString(dateRange.startDate) : null,
                end_date: dateRange.endDate ? toISODateString(dateRange.endDate) : null,
                api_key_pin: newPin,
            });
            console.log('API Key PIN saved to Supabase:', newPin);
        } catch (err) {
            console.error('Error saving API Key PIN:', err);
            showError('비밀번호 저장에 실패했습니다.');
        }
    };

    // Handle Gemini API Key change
    const handleGeminiApiKeyChange = async (newKey: string) => {
        setGeminiApiKey(newKey);
        try {
            await updateUserSettings({
                budget,
                start_date: dateRange.startDate ? toISODateString(dateRange.startDate) : null,
                end_date: dateRange.endDate ? toISODateString(dateRange.endDate) : null,
                gemini_api_key: newKey,
            });
            console.log('Gemini API Key saved to Supabase');
        } catch (err) {
            console.error('Error saving Gemini API Key:', err);
            showError('API 키 저장에 실패했습니다.');
        }
    };

    // Handle income add from settings modal
    const handleIncomeAdd = useCallback(async (data: {
        date: string;
        category: string;
        amount: number;
        source: string | null;
        method: string | null;
        note: string | null;
    }) => {
        try {
            const newIncome = await addIncome({
                date: data.date,
                category: data.category,
                amount: data.amount,
                source: data.source,
                method: data.method,
                note: data.note,
                user_id: 'default_user',
            });

            // 수입 금액을 예산에 자동 합산
            const newBudget = budget + data.amount;
            await handleBudgetChange(newBudget);

            setNewIncomeId(newIncome.id);
            setTimeout(() => setNewIncomeId(null), 3000);

            success(`수입이 추가되었습니다! (예산 +${data.amount.toLocaleString('ko-KR')}원)`);
            setShowIncomeInputModal(false);
        } catch (err) {
            console.error('Income add error:', err);
            showError(err instanceof Error ? err.message : '수입 추가에 실패했습니다.');
        }
    }, [addIncome, budget, handleBudgetChange, success, showError]);

    // Handle income edit
    const handleIncomeEditSave = async (id: string, updates: Partial<Income>) => {
        try {
            // 기존 수입 찾기
            const existingIncome = incomes.find(inc => inc.id === id);

            // 금액이 변경되었으면 예산 조정
            if (existingIncome && updates.amount !== undefined && updates.amount !== existingIncome.amount) {
                const amountDifference = updates.amount - existingIncome.amount;
                const newBudget = budget + amountDifference;
                await handleBudgetChange(Math.max(0, newBudget));
            }

            await updateIncome(id, updates);

            const amountChangeMsg = existingIncome && updates.amount !== undefined && updates.amount !== existingIncome.amount
                ? ` (예산 ${updates.amount - existingIncome.amount > 0 ? '+' : ''}${(updates.amount - existingIncome.amount).toLocaleString('ko-KR')}원)`
                : '';

            success(`수입이 수정되었습니다.${amountChangeMsg}`);
            setEditingIncome(null);
        } catch (err) {
            showError('수입 수정에 실패했습니다.');
        }
    };

    // Handle income delete
    const handleIncomeDelete = async (id: string) => {
        try {
            // 삭제할 수입의 금액을 찾기
            const incomeToDelete = incomes.find(inc => inc.id === id);
            if (incomeToDelete) {
                // 예산에서 차감
                const newBudget = budget - incomeToDelete.amount;
                await handleBudgetChange(Math.max(0, newBudget)); // 음수 방지
            }

            await deleteIncome(id);
            success(`수입이 삭제되었습니다. (예산 -${incomeToDelete?.amount.toLocaleString('ko-KR') || 0}원)`);
        } catch (err) {
            showError('수입 삭제에 실패했습니다.');
        }
    };

    // Settings view
    if (showSettings) {
        return (
            <Settings
                onBack={() => setShowSettings(false)}
                onResetData={handleResetData}
                budget={budget}
                onBudgetChange={handleBudgetChange}
                apiKeyPin={apiKeyPin}
                onApiKeyPinChange={handleApiKeyPinChange}
                geminiApiKey={geminiApiKey}
                onGeminiApiKeyChange={handleGeminiApiKeyChange}
                onIncomeAdd={handleIncomeAdd}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <Header
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                budget={budget}
                spent={totalSpent}
                onDateClick={() => setShowDatePicker(true)}
                onSettingsClick={() => setShowSettings(true)}
            />

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Receipt Uploader */}
                <ReceiptUploader
                    isAnalyzing={isAnalyzing}
                    onFileSelected={handleReceiptUpload}
                    onCancelAnalysis={() => setIsAnalyzing(false)}
                    onManualEntry={() => {
                        if (activeTab === 'income') {
                            setShowIncomeInputModal(true);
                        } else {
                            setShowManualExpenseModal(true);
                        }
                    }}
                    disabled={!supabaseInitialized}
                />

                {/* Search Bar */}
                <SearchBar
                    value={basicSearch}
                    onChange={setBasicSearch}
                    onAdvancedSearch={() => setShowAdvancedSearch(true)}
                    hasActiveFilters={hasActiveAdvancedFilters}
                />

                {/* Expense / Income List */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        {/* Tab Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('expense')}
                                className={`
                                    px-4 py-2 rounded-xl font-semibold text-sm transition-all
                                    ${activeTab === 'expense'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }
                                `}
                            >
                                지출 내역
                            </button>
                            <button
                                onClick={() => setActiveTab('income')}
                                className={`
                                    px-4 py-2 rounded-xl font-semibold text-sm transition-all
                                    ${activeTab === 'income'
                                        ? 'bg-success text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }
                                `}
                            >
                                수입 내역
                            </button>
                        </div>
                        {activeTab === 'expense' && filteredExpenses.length > 0 && (
                            <span className="text-caption text-text-secondary">
                                총 {filteredExpenses.length}건
                            </span>
                        )}
                        {activeTab === 'income' && incomes.length > 0 && (
                            <span className="text-caption text-text-secondary">
                                총 {incomes.length}건 | +{totalIncome.toLocaleString('ko-KR')}원
                            </span>
                        )}
                    </div>

                    {activeTab === 'expense' ? (
                        // Expense List
                        loading || settingsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
                                        <div className="skeleton h-5 w-32 rounded mb-2" />
                                        <div className="skeleton h-4 w-48 rounded mb-4" />
                                        <div className="flex justify-between items-center">
                                            <div className="skeleton h-6 w-16 rounded-full" />
                                            <div className="skeleton h-6 w-24 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ExpenseList
                                expenses={filteredExpenses}
                                onEdit={setEditingExpense}
                                onDelete={handleDelete}
                                onViewReceipt={handleViewReceipt}
                                newExpenseId={newExpenseId}
                            />
                        )
                    ) : (
                        // Income List
                        incomesLoading || settingsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
                                        <div className="skeleton h-5 w-32 rounded mb-2" />
                                        <div className="skeleton h-4 w-48 rounded mb-4" />
                                        <div className="flex justify-between items-center">
                                            <div className="skeleton h-6 w-16 rounded-full" />
                                            <div className="skeleton h-6 w-24 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <IncomeList
                                incomes={sortedIncomes}
                                onEdit={setEditingIncome}
                                onDelete={handleIncomeDelete}
                                newIncomeId={newIncomeId}
                            />
                        )
                    )}
                </div>
            </main>

            {/* Floating PDF Export Button */}
            {activeTab === 'expense' && filteredExpenses.length > 0 && (
                <button
                    onClick={handleExportPdf}
                    className="
            fixed bottom-6 right-6 md:bottom-8 md:right-8
            flex items-center gap-2
            px-6 py-4
            bg-gradient-to-r from-primary to-primary-700
            text-white font-semibold
            rounded-full shadow-lg hover:shadow-xl
            active:scale-95 transition-all
            z-30
          "
                >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">PDF로 저장</span>
                </button>
            )}

            {/* Floating Income PDF Export Button */}
            {activeTab === 'income' && incomes.length > 0 && (
                <button
                    onClick={async () => {
                        try {
                            await exportIncomeToPdf(incomes, dateRange, budget);
                            success('수입 내역 PDF가 생성되었습니다.');
                        } catch (err) {
                            showError('PDF 생성에 실패했습니다.');
                        }
                    }}
                    className="
            fixed bottom-6 right-6 md:bottom-8 md:right-8
            flex items-center gap-2
            px-6 py-4
            bg-gradient-to-r from-success to-green-600
            text-white font-semibold
            rounded-full shadow-lg hover:shadow-xl
            active:scale-95 transition-all
            z-30
          "
                >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">수입 PDF 저장</span>
                </button>
            )}

            {/* Date Range Picker Modal */}
            <DateRangePicker
                isOpen={showDatePicker}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onApply={handleDateRangeChange}
                onClose={() => setShowDatePicker(false)}
            />

            {/* Edit Modal */}
            <ExpenseEditModal
                isOpen={!!editingExpense}
                expense={editingExpense}
                onSave={handleEditSave}
                onClose={() => setEditingExpense(null)}
            />

            {/* Manual Expense Modal */}
            <ManualExpenseModal
                isOpen={showManualExpenseModal}
                onSave={handleManualExpenseAdd}
                onClose={() => setShowManualExpenseModal(false)}
            />

            {/* Income Input Modal */}
            <IncomeInputModal
                isOpen={showIncomeInputModal}
                onSave={handleIncomeAdd}
                onClose={() => setShowIncomeInputModal(false)}
            />

            {/* Income Edit Modal */}
            <IncomeEditModal
                isOpen={!!editingIncome}
                income={editingIncome}
                onSave={handleIncomeEditSave}
                onClose={() => setEditingIncome(null)}
            />

            {/* Advanced Search Modal */}
            <AdvancedSearchModal
                isOpen={showAdvancedSearch}
                filters={advancedFilters}
                onApply={setAdvancedFilters}
                onReset={() => setAdvancedFilters(emptyFilters)}
                onClose={() => setShowAdvancedSearch(false)}
            />

            {/* Receipt Image Modal */}
            <ReceiptImageModal
                isOpen={!!viewingReceipt}
                imageUrl={viewingReceipt?.image_url || ''}
                storeName={viewingReceipt?.store_name || ''}
                date={viewingReceipt?.date || ''}
                onClose={() => setViewingReceipt(null)}
            />

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertState.isOpen}
                title={alertState.title}
                message={alertState.message}
                onClose={() => setAlertState({ ...alertState, isOpen: false })}
                type="error"
            />

            {/* Toast Notifications */}
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default App;

