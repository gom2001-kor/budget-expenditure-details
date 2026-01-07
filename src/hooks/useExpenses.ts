import { useState, useEffect, useCallback } from 'react';
import type { Expense } from '../types';
import { getExpenses, addExpense as addExpenseService, updateExpense as updateExpenseService, deleteExpense as deleteExpenseService, deleteAllExpenses } from '../services/expenses';

/**
 * 지출 데이터 관리 훅
 */
export function useExpenses(supabaseInitialized: boolean) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 정렬 헬퍼 함수 - 날짜/시간 기준 내림차순
    const sortExpenses = (items: Expense[]): Expense[] => {
        return [...items].sort((a, b) => {
            // Sort by date descending
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            // If same date, sort by time descending
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeB.localeCompare(timeA);
        });
    };

    // 지출 목록 조회
    const fetchExpenses = useCallback(async () => {
        if (!supabaseInitialized) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getExpenses();
            setExpenses(sortExpenses(data));
        } catch (err) {
            setError(err instanceof Error ? err.message : '지출 조회 실패');
        } finally {
            setLoading(false);
        }
    }, [supabaseInitialized]);

    // 초기 로드
    useEffect(() => {
        if (supabaseInitialized) {
            fetchExpenses();
        }
    }, [supabaseInitialized, fetchExpenses]);

    // 지출 추가
    const addExpense = useCallback(async (
        expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
    ) => {
        try {
            const newExpense = await addExpenseService(expense);
            setExpenses((prev) => sortExpenses([newExpense, ...prev]));
            return newExpense;
        } catch (err) {
            throw err;
        }
    }, []);

    // 지출 수정
    const updateExpense = useCallback(async (
        id: string,
        updates: Partial<Expense>
    ) => {
        try {
            const updated = await updateExpenseService(id, updates);
            setExpenses((prev) =>
                sortExpenses(prev.map((e) => (e.id === id ? updated : e)))
            );
            return updated;
        } catch (err) {
            throw err;
        }
    }, []);

    // 지출 삭제
    const deleteExpense = useCallback(async (id: string) => {
        try {
            await deleteExpenseService(id);
            setExpenses((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            throw err;
        }
    }, []);

    // 모든 지출 삭제
    const clearAll = useCallback(async () => {
        try {
            await deleteAllExpenses();
            setExpenses([]);
        } catch (err) {
            throw err;
        }
    }, []);

    // 총 지출 금액
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
        expenses,
        loading,
        error,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        clearAll,
        totalSpent,
    };
}
