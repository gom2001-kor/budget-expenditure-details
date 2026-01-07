import { useState } from 'react';
import { Calendar, Settings, X } from 'lucide-react';
import { formatDateRange } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';

interface HeaderProps {
    startDate: Date | null;
    endDate: Date | null;
    budget: number;
    spent: number;
    onDateClick: () => void;
    onSettingsClick: () => void;
}

interface AmountModalState {
    isOpen: boolean;
    title: string;
    amount: number;
    colorClass: string;
}

export function Header({
    startDate,
    endDate,
    budget,
    spent,
    onDateClick,
    onSettingsClick,
}: HeaderProps) {
    const remaining = budget - spent;
    const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

    // Amount detail modal state
    const [amountModal, setAmountModal] = useState<AmountModalState>({
        isOpen: false,
        title: '',
        amount: 0,
        colorClass: '',
    });

    const getRemainingColor = () => {
        if (remaining < 0) return 'text-error';
        if (spentPercentage >= 80) return 'text-warning';
        return 'text-success';
    };

    const handleBudgetClick = () => {
        setAmountModal({
            isOpen: true,
            title: '총 예산',
            amount: budget,
            colorClass: 'text-text-primary',
        });
    };

    const handleSpentClick = () => {
        setAmountModal({
            isOpen: true,
            title: '총 지출',
            amount: spent,
            colorClass: 'text-primary',
        });
    };

    const handleRemainingClick = () => {
        setAmountModal({
            isOpen: true,
            title: '잔액',
            amount: remaining,
            colorClass: getRemainingColor(),
        });
    };

    return (
        <>
            <header className="sticky top-0 z-40 gradient-header shadow-lg">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-white font-bold text-xl">지출 관리</h1>
                        <button
                            onClick={onSettingsClick}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="설정"
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Date Range Selector */}
                    <button
                        onClick={onDateClick}
                        className="
                            w-full bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 mb-4
                            flex items-center justify-between
                            hover:bg-white active:scale-[0.98] transition-all
                            shadow-sm
                        "
                        aria-label="기간 선택"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-caption text-text-secondary">지출 기간</p>
                                <p className="text-body font-semibold text-text-primary">
                                    {formatDateRange(startDate, endDate)}
                                </p>
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Budget Dashboard */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Total Budget - Clickable */}
                        <button
                            onClick={handleBudgetClick}
                            className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm text-left hover:bg-white active:scale-[0.98] transition-all"
                        >
                            <p className="text-xs text-text-secondary mb-1">총 예산</p>
                            <p className="text-lg font-bold text-text-primary tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                                {formatCurrency(budget)}
                            </p>
                        </button>

                        {/* Total Spent - Clickable */}
                        <button
                            onClick={handleSpentClick}
                            className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-l-4 border-primary text-left hover:bg-white active:scale-[0.98] transition-all"
                        >
                            <p className="text-xs text-text-secondary mb-1">총 지출</p>
                            <p className="text-lg font-bold text-primary tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                                {formatCurrency(spent)}
                            </p>
                        </button>

                        {/* Remaining - Clickable */}
                        <button
                            onClick={handleRemainingClick}
                            className={`bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-l-4 min-w-0 overflow-hidden text-left hover:bg-white active:scale-[0.98] transition-all ${remaining < 0 ? 'border-error' : spentPercentage >= 80 ? 'border-warning' : 'border-success'}`}
                        >
                            <p className="text-xs text-text-secondary mb-1">잔액</p>
                            <p className={`text-lg font-bold tabular-nums whitespace-nowrap overflow-hidden text-ellipsis ${getRemainingColor()}`}>
                                {formatCurrency(remaining)}
                            </p>
                        </button>
                    </div>
                </div>
            </header>

            {/* Amount Detail Modal */}
            {amountModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in"
                    onClick={() => setAmountModal({ ...amountModal, isOpen: false })}
                >
                    <div
                        className="bg-white rounded-2xl shadow-modal p-6 mx-4 min-w-[280px] animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">{amountModal.title}</h3>
                            <button
                                onClick={() => setAmountModal({ ...amountModal, isOpen: false })}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="닫기"
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>
                        <p className={`text-3xl font-bold tabular-nums text-center py-4 ${amountModal.colorClass}`}>
                            {formatCurrency(amountModal.amount)}
                        </p>
                        <button
                            onClick={() => setAmountModal({ ...amountModal, isOpen: false })}
                            className="w-full mt-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

