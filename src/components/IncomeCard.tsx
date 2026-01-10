import { Edit2, Trash2, Building2 } from 'lucide-react';
import type { Income } from '../types';
import { formatCurrency, getCategoryColor } from '../utils/formatUtils';
import { formatDateWithDay } from '../utils/dateUtils';

interface IncomeCardProps {
    income: Income;
    onEdit: (income: Income) => void;
    onDelete: (id: string) => void;
    isNew?: boolean;
}

export function IncomeCard({ income, onEdit, onDelete, isNew }: IncomeCardProps) {
    const categoryColor = getCategoryColor(income.category);

    return (
        <div
            className={`
        relative bg-white rounded-2xl shadow-card overflow-hidden
        card-hover
        ${isNew ? 'animate-slide-up' : ''}
      `}
        >
            {/* Category color strip - green tint for income */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 bg-success"
            />

            <div className="p-4 pl-5">
                {/* Header: Source + Actions */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-body font-semibold text-text-primary truncate">
                            {income.source || income.category}
                        </h3>
                        <p className="text-caption text-text-secondary">
                            {formatDateWithDay(income.date)}
                            {income.method && ` · ${income.method}`}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 -mr-2">
                        <button
                            onClick={() => onEdit(income)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="수정"
                        >
                            <Edit2 className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button
                            onClick={() => onDelete(income.id)}
                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                            aria-label="삭제"
                        >
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>
                </div>

                {/* Source info */}
                {income.source && income.source !== income.category && (
                    <div className="flex items-center gap-1 text-caption text-text-secondary mb-2">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{income.source}</span>
                    </div>
                )}

                {/* Note - 비고 */}
                {income.note && (
                    <div className="text-caption text-text-secondary mb-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <span className="text-text-secondary/70">메모:</span>{' '}
                        <span className="text-text-primary">{income.note}</span>
                    </div>
                )}

                {/* Category + Amount */}
                <div className="flex items-center justify-between mt-3">
                    <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                            backgroundColor: `${categoryColor}15`,
                            color: categoryColor,
                        }}
                    >
                        {income.category}
                    </span>
                    <p className="text-xl font-bold text-success tabular-nums">
                        +{formatCurrency(income.amount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
