import type { Income } from '../types';
import { IncomeCard } from './IncomeCard';
import { IncomeTable } from './IncomeTable';
import { EmptyState } from './EmptyState';

interface IncomeListProps {
    incomes: Income[];
    onEdit: (income: Income) => void;
    onDelete: (id: string) => void;
    newIncomeId?: string | null;
}

export function IncomeList({ incomes, onEdit, onDelete, newIncomeId }: IncomeListProps) {
    if (incomes.length === 0) {
        return <EmptyState message="수입 내역이 없습니다" subMessage="설정에서 수입을 입력해 주세요" />;
    }

    return (
        <>
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-3">
                {incomes.map((income) => (
                    <IncomeCard
                        key={income.id}
                        income={income}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isNew={income.id === newIncomeId}
                    />
                ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
                <IncomeTable
                    incomes={incomes}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>
        </>
    );
}
