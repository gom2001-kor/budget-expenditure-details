import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Income } from '../types';
import { formatCurrencyInput, extractNumber } from '../utils/formatUtils';

// 수입 분류 옵션
const INCOME_CATEGORIES = ['조합비', '기타(직접 입력)'];

// 수입처 옵션
const INCOME_SOURCES = ['전년도 잔액 이월', '대전지방국토관리청', '기타(직접 입력)'];

// 형식 옵션
const INCOME_METHODS = ['계좌이체', '현금'];

interface IncomeEditModalProps {
    isOpen: boolean;
    income: Income | null;
    onSave: (id: string, updates: Partial<Income>) => void;
    onClose: () => void;
}

export function IncomeEditModal({
    isOpen,
    income,
    onSave,
    onClose,
}: IncomeEditModalProps) {
    const [formData, setFormData] = useState({
        date: '',
        category: '조합비',
        customCategory: '',
        amount: '',
        source: '전년도 잔액 이월',
        customSource: '',
        method: '계좌이체',
        note: '',
    });

    useEffect(() => {
        if (income) {
            // 분류가 기본 옵션에 없으면 '기타(직접 입력)'으로 설정
            const isCustomCategory = !INCOME_CATEGORIES.includes(income.category) && income.category !== '기타(직접 입력)';
            const isCustomSource = income.source && !INCOME_SOURCES.includes(income.source) && income.source !== '기타(직접 입력)';

            setFormData({
                date: income.date,
                category: isCustomCategory ? '기타(직접 입력)' : income.category,
                customCategory: isCustomCategory ? income.category : '',
                amount: income.amount.toLocaleString('ko-KR'),
                source: isCustomSource ? '기타(직접 입력)' : (income.source || '전년도 잔액 이월'),
                customSource: isCustomSource ? (income.source || '') : '',
                method: income.method || '계좌이체',
                note: income.note || '',
            });
        }
    }, [income]);

    if (!isOpen || !income) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 분류 결정
        const finalCategory = formData.category === '기타(직접 입력)'
            ? formData.customCategory || '기타'
            : formData.category;

        // 수입처 결정
        const finalSource = formData.source === '기타(직접 입력)'
            ? formData.customSource || '기타'
            : formData.source;

        onSave(income.id, {
            date: formData.date,
            category: finalCategory,
            amount: extractNumber(formData.amount),
            source: finalSource || null,
            method: formData.method || null,
            note: formData.note || null,
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
                    <h2 className="text-subtitle text-text-primary">수입 수정</h2>
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
                            날짜 *
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

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            분류 *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all bg-white
              "
                        >
                            {INCOME_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {formData.category === '기타(직접 입력)' && (
                            <input
                                type="text"
                                value={formData.customCategory}
                                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                placeholder="분류를 직접 입력하세요"
                                className="
                  w-full h-12 px-4 rounded-xl border border-border mt-2
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all
                "
                            />
                        )}
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

                    {/* Source (수입처) */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            수입처
                        </label>
                        <select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all bg-white
              "
                        >
                            {INCOME_SOURCES.map((src) => (
                                <option key={src} value={src}>{src}</option>
                            ))}
                        </select>
                        {formData.source === '기타(직접 입력)' && (
                            <input
                                type="text"
                                value={formData.customSource}
                                onChange={(e) => setFormData({ ...formData, customSource: e.target.value })}
                                placeholder="수입처를 직접 입력하세요"
                                className="
                  w-full h-12 px-4 rounded-xl border border-border mt-2
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all
                "
                            />
                        )}
                    </div>

                    {/* Method (형식) */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            형식
                        </label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all bg-white
              "
                        >
                            {INCOME_METHODS.map((method) => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    {/* Note (비고) */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            비고
                        </label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="메모를 입력하세요"
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
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
                            className="flex-1 h-12 bg-success text-white font-semibold rounded-xl hover:bg-green-600 active:scale-95 transition-all btn-press"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
