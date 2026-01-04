import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Expense } from '../types';
import { CATEGORIES, formatCurrencyInput, extractNumber } from '../utils/formatUtils';

interface ExpenseEditModalProps {
    isOpen: boolean;
    expense: Expense | null;
    onSave: (id: string, updates: Partial<Expense>) => void;
    onClose: () => void;
}

export function ExpenseEditModal({
    isOpen,
    expense,
    onSave,
    onClose,
}: ExpenseEditModalProps) {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        store_name: '',
        address: '',
        amount: '',
        category: '기타',
    });

    useEffect(() => {
        if (expense) {
            setFormData({
                date: expense.date,
                time: expense.time || '',
                store_name: expense.store_name,
                address: expense.address || '',
                amount: expense.amount.toLocaleString('ko-KR'),
                category: expense.category,
            });
        }
    }, [expense]);

    if (!isOpen || !expense) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSave(expense.id, {
            date: formData.date,
            time: formData.time || null,
            store_name: formData.store_name,
            address: formData.address || null,
            amount: extractNumber(formData.amount),
            category: formData.category,
        });

        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop animate-fade-in"
            onClick={onClose}
        >
            <div
                className="
          w-full md:w-full md:max-w-md
          bg-white
          rounded-t-3xl md:rounded-3xl
          shadow-modal
          animate-slide-up md:animate-scale-in
          max-h-[90vh] overflow-y-auto
        "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-border rounded-t-3xl">
                    <h2 className="text-subtitle text-text-primary">지출 수정</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            날짜
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            시간
                        </label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            가게명 *
                        </label>
                        <input
                            type="text"
                            value={formData.store_name}
                            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                            required
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            주소
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            카테고리
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all bg-white
              "
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            금액 *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">₩</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: formatCurrencyInput(e.target.value) })}
                                required
                                className="
                  w-full h-12 pl-8 pr-4 rounded-xl border border-border
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all tabular-nums
                "
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 safe-bottom">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all btn-press"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all btn-press"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
