import { getSupabaseClient } from './supabase';
import type { Expense } from '../types';

/**
 * 모든 지출 내역 조회
 */
export async function getExpenses(): Promise<Expense[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

    if (error) {
        console.error('Get expenses error:', error);
        throw new Error('지출 내역 조회에 실패했습니다.');
    }

    return data || [];
}

/**
 * 기간별 지출 내역 조회
 */
export async function getExpensesByDateRange(
    startDate: string,
    endDate: string
): Promise<Expense[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

    if (error) {
        console.error('Get expenses by date range error:', error);
        throw new Error('지출 내역 조회에 실패했습니다.');
    }

    return data || [];
}

/**
 * 지출 항목 추가
 */
export async function addExpense(
    expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
): Promise<Expense> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();

    if (error) {
        console.error('Add expense error:', error);
        // 상세 에러 메시지 전달
        throw new Error(`저장 실패: ${error.message} (코드: ${error.code})`);
    }

    return data;
}

/**
 * 지출 항목 수정
 */
export async function updateExpense(
    id: string,
    updates: Partial<Expense>
): Promise<Expense> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Update expense error:', error);
        throw new Error('지출 수정에 실패했습니다.');
    }

    return data;
}

/**
 * 지출 항목 삭제
 */
export async function deleteExpense(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete expense error:', error);
        throw new Error('지출 삭제에 실패했습니다.');
    }
}

/**
 * 모든 지출 삭제
 */
export async function deleteAllExpenses(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { error } = await supabase
        .from('expenses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 항목 삭제

    if (error) {
        console.error('Delete all expenses error:', error);
        throw new Error('데이터 초기화에 실패했습니다.');
    }
}
