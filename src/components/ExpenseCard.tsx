import { MapPin, Edit2, Trash2 } from 'lucide-react';
import type { Expense } from '../types';
import { formatCurrency, getCategoryColor } from '../utils/formatUtils';
import { formatDateWithDay, formatTime } from '../utils/dateUtils';

interface ExpenseCardProps {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    isNew?: boolean;
}

export function ExpenseCard({ expense, onEdit, onDelete, isNew }: ExpenseCardProps) {
    const categoryColor = getCategoryColor(expense.category);

    return (
        <div
            className={`
        relative bg-white rounded-2xl shadow-card overflow-hidden
        card-hover
        ${isNew ? 'animate-slide-up' : ''}
      `}
        >
            {/* Category color strip */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: categoryColor }}
            />

            <div className="p-4 pl-5">
                {/* Header: Store name + Actions */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-body font-semibold text-text-primary truncate">
                            {expense.store_name}
                        </h3>
                        <p className="text-caption text-text-secondary">
                            {formatDateWithDay(expense.date)}
                            {expense.time && ` · ${formatTime(expense.time)}`}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 -mr-2">
                        <button
                            onClick={() => onEdit(expense)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="수정"
                        >
                            <Edit2 className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button
                            onClick={() => onDelete(expense.id)}
                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                            aria-label="삭제"
                        >
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>
                </div>

                {/* Address */}
                {expense.address && (
                    <div className="flex items-center gap-1 text-caption text-text-secondary mb-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{expense.address}</span>
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
                        {expense.category}
                    </span>
                    <p className="text-xl font-bold text-primary tabular-nums">
                        {formatCurrency(expense.amount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
