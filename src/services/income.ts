import { getSupabaseClient } from './supabase';
import type { Income } from '../types';

/**
 * 모든 수입 내역 조회
 */
export async function getIncomes(): Promise<Income[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Get incomes error:', error);
        throw new Error('수입 내역 조회에 실패했습니다.');
    }

    return data || [];
}

/**
 * 기간별 수입 내역 조회
 */
export async function getIncomesByDateRange(
    startDate: string,
    endDate: string
): Promise<Income[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('income')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

    if (error) {
        console.error('Get incomes by date range error:', error);
        throw new Error('수입 내역 조회에 실패했습니다.');
    }

    return data || [];
}

/**
 * 수입 항목 추가
 */
export async function addIncome(
    income: Omit<Income, 'id' | 'created_at' | 'updated_at'>
): Promise<Income> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('income')
        .insert([income])
        .select()
        .single();

    if (error) {
        console.error('Add income error:', error);
        throw new Error(`저장 실패: ${error.message} (코드: ${error.code})`);
    }

    return data;
}

/**
 * 수입 항목 수정
 */
export async function updateIncome(
    id: string,
    updates: Partial<Income>
): Promise<Income> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabase
        .from('income')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Update income error:', error);
        throw new Error('수입 수정에 실패했습니다.');
    }

    return data;
}

/**
 * 수입 항목 삭제
 */
export async function deleteIncome(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete income error:', error);
        throw new Error('수입 삭제에 실패했습니다.');
    }
}

/**
 * 모든 수입 삭제
 */
export async function deleteAllIncomes(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const { error } = await supabase
        .from('income')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error('Delete all incomes error:', error);
        throw new Error('수입 데이터 초기화에 실패했습니다.');
    }
}
