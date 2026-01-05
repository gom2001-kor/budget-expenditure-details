import { useState, useEffect } from 'react';
import { Calendar, Settings } from 'lucide-react';
import { formatDateRange } from '../utils/dateUtils';
import { formatCurrency, formatCurrencyInput, extractNumber } from '../utils/formatUtils';

interface HeaderProps {
    startDate: Date | null;
    endDate: Date | null;
    budget: number;
    spent: number;
    onDateClick: () => void;
    onBudgetChange: (budget: number) => void;
    onSettingsClick: () => void;
}

export function Header({
    startDate,
    endDate,
    budget,
    spent,
    onDateClick,
    onBudgetChange,
    onSettingsClick,
}: HeaderProps) {
    const [budgetInput, setBudgetInput] = useState(budget > 0 ? budget.toLocaleString('ko-KR') : '');
    const remaining = budget - spent;
    const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

    // budget prop이 외부에서 변경되면 input 값도 동기화
    useEffect(() => {
        setBudgetInput(budget > 0 ? budget.toLocaleString('ko-KR') : '');
    }, [budget]);

    const handleBudgetChange = (value: string) => {
        const formatted = formatCurrencyInput(value);
        setBudgetInput(formatted);
        onBudgetChange(extractNumber(value));
    };

    const getRemainingColor = () => {
        if (remaining < 0) return 'text-error';
        if (spentPercentage >= 80) return 'text-warning';
        return 'text-success';
    };

    return (
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
                <div className="grid grid-cols-2 gap-3">
                    {/* Total Budget */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <p className="text-caption text-text-secondary mb-1">총 예산</p>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-bold text-text-primary">₩</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={budgetInput}
                                onChange={(e) => handleBudgetChange(e.target.value)}
                                placeholder="0"
                                className="
                  w-full pl-5 text-2xl font-bold text-text-primary
                  bg-transparent border-none outline-none
                  tabular-nums
                "
                                aria-label="총 예산 입력"
                            />
                        </div>
                    </div>

                    {/* Remaining */}
                    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border-l-4 min-w-0 overflow-hidden ${remaining < 0 ? 'border-error' : spentPercentage >= 80 ? 'border-warning' : 'border-success'}`}>
                        <p className="text-sm font-semibold text-text-primary mb-1">잔액</p>
                        <p className={`text-base sm:text-xl font-bold tabular-nums whitespace-nowrap overflow-hidden text-ellipsis ${getRemainingColor()}`}>
                            {formatCurrency(remaining)}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
