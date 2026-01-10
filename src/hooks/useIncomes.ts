import { useState, useEffect, useCallback } from 'react';
import type { Income } from '../types';
import { getIncomes, addIncome as addIncomeService, updateIncome as updateIncomeService, deleteIncome as deleteIncomeService, deleteAllIncomes } from '../services/income';

/**
 * 수입 데이터 관리 훅
 */
export function useIncomes(supabaseInitialized: boolean) {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 정렬 헬퍼 함수 - 날짜 기준 내림차순
    const sortIncomes = (items: Income[]): Income[] => {
        return [...items].sort((a, b) => {
            return b.date.localeCompare(a.date);
        });
    };

    // 수입 목록 조회
    const fetchIncomes = useCallback(async () => {
        if (!supabaseInitialized) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getIncomes();
            setIncomes(sortIncomes(data));
        } catch (err) {
            setError(err instanceof Error ? err.message : '수입 조회 실패');
        } finally {
            setLoading(false);
        }
    }, [supabaseInitialized]);

    // 초기 로드
    useEffect(() => {
        if (supabaseInitialized) {
            fetchIncomes();
        }
    }, [supabaseInitialized, fetchIncomes]);

    // 수입 추가
    const addIncome = useCallback(async (
        income: Omit<Income, 'id' | 'created_at' | 'updated_at'>
    ) => {
        try {
            const newIncome = await addIncomeService(income);
            setIncomes((prev) => sortIncomes([newIncome, ...prev]));
            return newIncome;
        } catch (err) {
            throw err;
        }
    }, []);

    // 수입 수정
    const updateIncome = useCallback(async (
        id: string,
        updates: Partial<Income>
    ) => {
        try {
            const updated = await updateIncomeService(id, updates);
            setIncomes((prev) =>
                sortIncomes(prev.map((i) => (i.id === id ? updated : i)))
            );
            return updated;
        } catch (err) {
            throw err;
        }
    }, []);

    // 수입 삭제
    const deleteIncome = useCallback(async (id: string) => {
        try {
            await deleteIncomeService(id);
            setIncomes((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            throw err;
        }
    }, []);

    // 모든 수입 삭제
    const clearAll = useCallback(async () => {
        try {
            await deleteAllIncomes();
            setIncomes([]);
        } catch (err) {
            throw err;
        }
    }, []);

    // 총 수입 금액
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    return {
        incomes,
        loading,
        error,
        fetchIncomes,
        addIncome,
        updateIncome,
        deleteIncome,
        clearAll,
        totalIncome,
    };
}
