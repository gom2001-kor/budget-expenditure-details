import { Edit2, Trash2, Image } from 'lucide-react';
import type { Expense } from '../types';
import { formatCurrency, getCategoryColor } from '../utils/formatUtils';
import { formatDate, formatTime } from '../utils/dateUtils';

interface ExpenseTableProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    onViewReceipt?: (expense: Expense) => void;
}

export function ExpenseTable({ expenses, onEdit, onDelete, onViewReceipt }: ExpenseTableProps) {
    return (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                날짜
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                시간
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                가게명
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                주소
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                카테고리
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                지출 사유
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                금액
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50 w-28">
                                관리
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense, index) => {
                            const categoryColor = getCategoryColor(expense.category);
                            return (
                                <tr
                                    key={expense.id}
                                    className={`
                    border-t border-slate-100
                    hover:bg-blue-50/50 transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  `}
                                >
                                    <td className="px-4 py-3 text-sm text-text-primary">
                                        {formatDate(expense.date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary">
                                        {formatTime(expense.time)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-primary font-medium max-w-[120px] truncate">
                                        {expense.store_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary max-w-[150px] truncate">
                                        {expense.address || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: `${categoryColor}15`,
                                                color: categoryColor,
                                            }}
                                        >
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary max-w-[150px] truncate">
                                        {expense.reason || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-bold text-text-primary tabular-nums">
                                            {formatCurrency(expense.amount)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* 영수증 보기 버튼 */}
                                            {expense.image_url && onViewReceipt && (
                                                <button
                                                    onClick={() => onViewReceipt(expense)}
                                                    className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                    aria-label="영수증 보기"
                                                >
                                                    <Image className="w-4 h-4 text-primary" />
                                                </button>
                                            )}
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
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

