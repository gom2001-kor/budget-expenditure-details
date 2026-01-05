import type { Expense } from '../types';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseTable } from './ExpenseTable';
import { EmptyState } from './EmptyState';

interface ExpenseListProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    onViewReceipt?: (expense: Expense) => void;
    newExpenseId?: string | null;
}

export function ExpenseList({ expenses, onEdit, onDelete, onViewReceipt, newExpenseId }: ExpenseListProps) {
    if (expenses.length === 0) {
        return <EmptyState />;
    }

    return (
        <>
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-3">
                {expenses.map((expense) => (
                    <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewReceipt={onViewReceipt}
                        isNew={expense.id === newExpenseId}
                    />
                ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
                <ExpenseTable
                    expenses={expenses}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewReceipt={onViewReceipt}
                />
            </div>
        </>
    );
}

