import { useState, useEffect } from 'react';
import { X, Search, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../utils/formatUtils';

export interface AdvancedFilters {
    dateFrom: string;
    dateTo: string;
    category: string;
    minAmount: string;
    maxAmount: string;
    storeName: string;
    reason: string;
}

export const emptyFilters: AdvancedFilters = {
    dateFrom: '',
    dateTo: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    storeName: '',
    reason: '',
};

interface AdvancedSearchModalProps {
    isOpen: boolean;
    filters: AdvancedFilters;
    onApply: (filters: AdvancedFilters) => void;
    onReset: () => void;
    onClose: () => void;
}

export function AdvancedSearchModal({
    isOpen,
    filters,
    onApply,
    onReset,
    onClose,
}: AdvancedSearchModalProps) {
    const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        setLocalFilters(emptyFilters);
        onReset();
    };

    const formatNumberInput = (value: string): string => {
        const num = value.replace(/[^\d]/g, '');
        if (!num) return '';
        return parseInt(num, 10).toLocaleString('ko-KR');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop animate-fade-in"
            onClick={onClose}
        >
            <div
                className="
                    w-full md:w-full md:max-w-lg
                    bg-white
                    rounded-t-3xl md:rounded-3xl
                    shadow-modal
                    animate-slide-up md:animate-scale-in
                    max-h-[90vh] overflow-y-auto
                "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-border rounded-t-3xl z-10">
                    <h2 className="text-subtitle text-text-primary flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        상세 검색
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            날짜 범위
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="date"
                                    value={localFilters.dateFrom}
                                    onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                                    className="
                                        w-full h-11 px-3 rounded-xl border border-border
                                        focus:border-primary focus:ring-2 focus:ring-primary/20
                                        transition-all text-sm
                                    "
                                    placeholder="시작일"
                                />
                                <span className="text-xs text-text-secondary mt-1 block">시작일</span>
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={localFilters.dateTo}
                                    onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                                    className="
                                        w-full h-11 px-3 rounded-xl border border-border
                                        focus:border-primary focus:ring-2 focus:ring-primary/20
                                        transition-all text-sm
                                    "
                                    placeholder="종료일"
                                />
                                <span className="text-xs text-text-secondary mt-1 block">종료일</span>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            카테고리
                        </label>
                        <select
                            value={localFilters.category}
                            onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                            className="
                                w-full h-11 px-3 rounded-xl border border-border
                                focus:border-primary focus:ring-2 focus:ring-primary/20
                                transition-all text-sm bg-white
                            "
                        >
                            <option value="">전체 카테고리</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount Range */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            금액 범위
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">₩</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={localFilters.minAmount}
                                    onChange={(e) => setLocalFilters({ ...localFilters, minAmount: formatNumberInput(e.target.value) })}
                                    placeholder="최소"
                                    className="
                                        w-full h-11 pl-7 pr-3 rounded-xl border border-border
                                        focus:border-primary focus:ring-2 focus:ring-primary/20
                                        transition-all text-sm tabular-nums
                                    "
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">₩</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={localFilters.maxAmount}
                                    onChange={(e) => setLocalFilters({ ...localFilters, maxAmount: formatNumberInput(e.target.value) })}
                                    placeholder="최대"
                                    className="
                                        w-full h-11 pl-7 pr-3 rounded-xl border border-border
                                        focus:border-primary focus:ring-2 focus:ring-primary/20
                                        transition-all text-sm tabular-nums
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            가게명
                        </label>
                        <input
                            type="text"
                            value={localFilters.storeName}
                            onChange={(e) => setLocalFilters({ ...localFilters, storeName: e.target.value })}
                            placeholder="가게명 검색..."
                            className="
                                w-full h-11 px-3 rounded-xl border border-border
                                focus:border-primary focus:ring-2 focus:ring-primary/20
                                transition-all text-sm
                            "
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            지출 사유
                        </label>
                        <input
                            type="text"
                            value={localFilters.reason}
                            onChange={(e) => setLocalFilters({ ...localFilters, reason: e.target.value })}
                            placeholder="지출 사유 검색..."
                            className="
                                w-full h-11 px-3 rounded-xl border border-border
                                focus:border-primary focus:ring-2 focus:ring-primary/20
                                transition-all text-sm
                            "
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 safe-bottom">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            초기화
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="flex items-center justify-center gap-2 flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all"
                        >
                            <Search className="w-4 h-4" />
                            검색
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
