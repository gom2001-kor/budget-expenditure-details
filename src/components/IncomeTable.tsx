import { Edit2, Trash2 } from 'lucide-react';
import type { Income } from '../types';
import { formatCurrency, getCategoryColor } from '../utils/formatUtils';
import { formatDate } from '../utils/dateUtils';

interface IncomeTableProps {
    incomes: Income[];
    onEdit: (income: Income) => void;
    onDelete: (id: string) => void;
}

export function IncomeTable({ incomes, onEdit, onDelete }: IncomeTableProps) {
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
                                분류
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                수입처
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                금액
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50">
                                형식
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary sticky top-0 bg-slate-50 w-28">
                                관리
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {incomes.map((income, index) => {
                            const categoryColor = getCategoryColor(income.category);
                            return (
                                <tr
                                    key={income.id}
                                    className={`
                    border-t border-slate-100
                    hover:bg-green-50/50 transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  `}
                                >
                                    <td className="px-4 py-3 text-sm text-text-primary">
                                        {formatDate(income.date)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: `${categoryColor}15`,
                                                color: categoryColor,
                                            }}
                                        >
                                            {income.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary max-w-[150px] truncate">
                                        {income.source || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-bold text-success tabular-nums">
                                            +{formatCurrency(income.amount)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary">
                                        {income.method || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
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
