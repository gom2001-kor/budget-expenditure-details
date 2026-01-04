import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { X } from 'lucide-react';

interface DateRangePickerProps {
    isOpen: boolean;
    startDate: Date | null;
    endDate: Date | null;
    onApply: (start: Date | null, end: Date | null) => void;
    onClose: () => void;
}

export function DateRangePicker({
    isOpen,
    startDate,
    endDate,
    onApply,
    onClose,
}: DateRangePickerProps) {
    const [localStartDate, setLocalStartDate] = useState<Date | null>(startDate);
    const [localEndDate, setLocalEndDate] = useState<Date | null>(endDate);

    if (!isOpen) return null;

    const handleChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setLocalStartDate(start);
        setLocalEndDate(end);
    };

    const handleApply = () => {
        onApply(localStartDate, localEndDate);
        onClose();
    };

    const handleReset = () => {
        setLocalStartDate(null);
        setLocalEndDate(null);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop animate-fade-in"
            onClick={onClose}
        >
            <div
                className="
          w-full md:w-auto md:max-w-md
          bg-white
          rounded-t-3xl md:rounded-3xl
          shadow-modal
          animate-slide-up md:animate-scale-in
          overflow-hidden
        "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-subtitle text-text-primary">기간 선택</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Calendar */}
                <div className="flex justify-center p-4">
                    <DatePicker
                        selected={localStartDate}
                        onChange={handleChange}
                        startDate={localStartDate}
                        endDate={localEndDate}
                        selectsRange
                        inline
                        locale={ko}
                        dateFormat="yyyy.MM.dd"
                        monthsShown={1}
                        showPopperArrow={false}
                    />
                </div>

                {/* Selected dates display */}
                <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        {localStartDate && localEndDate ? (
                            <p className="text-body font-semibold text-text-primary">
                                {localStartDate.toLocaleDateString('ko-KR')} ~ {localEndDate.toLocaleDateString('ko-KR')}
                            </p>
                        ) : localStartDate ? (
                            <p className="text-body text-text-secondary">
                                종료일을 선택하세요
                            </p>
                        ) : (
                            <p className="text-body text-text-secondary">
                                시작일을 선택하세요
                            </p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 px-6 pb-6 safe-bottom">
                    <button
                        onClick={handleReset}
                        className="flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all btn-press"
                    >
                        초기화
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!localStartDate || !localEndDate}
                        className="
              flex-1 h-12 bg-primary text-white font-semibold rounded-xl
              hover:bg-primary-700 active:scale-95 transition-all btn-press
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
            "
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}
