import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { DateRangePicker } from './components/DateRangePicker';
import { ReceiptUploader } from './components/ReceiptUploader';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseEditModal } from './components/ExpenseEditModal';
import { AlertModal } from './components/AlertModal';
import { Toast } from './components/Toast';
import { Settings } from './components/Settings';
import { ReceiptImageModal } from './components/ReceiptImageModal';

// Services
import { initializeSupabase, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, getUserSettings, updateUserSettings } from './services/supabase';
import { analyzeReceipt } from './services/gemini';
import { uploadImage } from './services/storage';

// Hooks
import { useExpenses } from './hooks/useExpenses';
import { useToast } from './hooks/useToast';

// Utils
import { isDateInRange, formatDateRangeKorean } from './utils/dateUtils';
import { exportToPdf } from './utils/pdfExport';

// Types
import type { Expense, DateRange } from './types';

function App() {
    // App state
    const [showSettings, setShowSettings] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [supabaseInitialized, setSupabaseInitialized] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Settings state (from Supabase)
    const [budget, setBudget] = useState(0);
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
                if (settings) {
                    setBudget(settings.budget || 0);
                    setDateRange({
                        startDate: settings.start_date ? new Date(settings.start_date) : null,
                        endDate: settings.end_date ? new Date(settings.end_date) : null,
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

    // Filter expenses by date range
    const filteredExpenses = expenses.filter((expense) => {
        if (!dateRange.startDate || !dateRange.endDate) return true;
        return isDateInRange(expense.date, dateRange.startDate, dateRange.endDate);
    });

    // Handle date range change with Supabase sync
    const handleDateRangeChange = async (start: Date | null, end: Date | null) => {
        setDateRange({ startDate: start, endDate: end });

        // Sync to Supabase
        const result = await updateUserSettings({
            budget,
            start_date: start ? start.toISOString().split('T')[0] : null,
            end_date: end ? end.toISOString().split('T')[0] : null,
        });

        if (!result.success) {
            console.error('Save date range error:', result.error);
            showError('설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    // Handle budget change with Supabase sync
    const handleBudgetChange = async (newBudget: number) => {
        setBudget(newBudget);

        // Sync to Supabase
        const result = await updateUserSettings({
            budget: newBudget,
            start_date: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : null,
            end_date: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : null,
        });

        if (!result.success) {
            console.error('Save budget error:', result.error);
            showError('설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    // Handle receipt upload
    const handleReceiptUpload = useCallback(async (file: File) => {
        setIsAnalyzing(true);

        try {
            // 1. Analyze receipt with Gemini
            const analyzed = await analyzeReceipt(file);

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

    // Settings view
    if (showSettings) {
        return (
            <Settings
                onBack={() => setShowSettings(false)}
                onResetData={handleResetData}
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
                onBudgetChange={handleBudgetChange}
                onSettingsClick={() => setShowSettings(true)}
            />

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Receipt Uploader */}
                <ReceiptUploader
                    isAnalyzing={isAnalyzing}
                    onFileSelected={handleReceiptUpload}
                    onCancelAnalysis={() => setIsAnalyzing(false)}
                    disabled={!supabaseInitialized}
                />

                {/* Expense List */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-subtitle text-text-primary">지출 내역</h2>
                        {filteredExpenses.length > 0 && (
                            <span className="text-caption text-text-secondary">
                                총 {filteredExpenses.length}건
                            </span>
                        )}
                    </div>

                    {loading || settingsLoading ? (
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
                    )}
                </div>
            </main>

            {/* Floating PDF Export Button */}
            {filteredExpenses.length > 0 && (
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

