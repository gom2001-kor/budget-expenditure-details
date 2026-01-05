import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UserSettings } from '../types';

let supabaseClient: SupabaseClient | null = null;

/**
 * Supabase 클라이언트 초기화
 */
export function initializeSupabase(url: string, key: string): SupabaseClient {
    supabaseClient = createClient(url, key);
    return supabaseClient;
}

/**
 * 현재 Supabase 클라이언트 반환
 */
export function getSupabaseClient(): SupabaseClient | null {
    return supabaseClient;
}

/**
 * Supabase 연결 테스트 (간단)
 */
export async function testConnection(url: string, key: string): Promise<boolean> {
    try {
        const client = createClient(url, key);
        const { error } = await client.from('expenses').select('id').limit(1);

        // 테이블이 없어도 연결은 성공한 것으로 간주
        if (error && !error.message.includes('does not exist')) {
            console.error('Supabase connection error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Supabase connection failed:', err);
        return false;
    }
}

/**
 * Supabase 연결 상세 테스트 - 에러 메시지 반환
 */
export async function testConnectionDetailed(): Promise<{ success: boolean; message: string; data?: unknown }> {
    const supabase = supabaseClient;

    if (!supabase) {
        return {
            success: false,
            message: 'Supabase 클라이언트가 초기화되지 않았습니다.'
        };
    }

    try {
        const { data, error, count } = await supabase
            .from('expenses')
            .select('*', { count: 'exact' })
            .limit(1);

        if (error) {
            return {
                success: false,
                message: `DB 오류: ${error.message} (코드: ${error.code})`,
                data: error
            };
        }

        return {
            success: true,
            message: `연결 성공! 총 ${count ?? 0}개의 데이터가 있습니다.`,
            data: data
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
        return {
            success: false,
            message: `연결 실패: ${errorMessage}`,
            data: err
        };
    }
}

/**
 * 사용자 설정 조회
 */
export async function getUserSettings(userId: string = 'default_user'): Promise<UserSettings | null> {
    const supabase = supabaseClient;
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // 데이터가 없는 경우 null 반환 (에러 아님)
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Get user settings error:', error);
            return null;
        }

        return data as UserSettings;
    } catch (err) {
        console.error('Get user settings failed:', err);
        return null;
    }
}

/**
 * 사용자 설정 저장/업데이트 (upsert)
 */
export async function updateUserSettings(settings: Partial<UserSettings>, userId: string = 'default_user'): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
    const supabase = supabaseClient;
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    const settingsToSave = {
        user_id: userId,
        budget: settings.budget ?? 0,
        start_date: settings.start_date || null,
        end_date: settings.end_date || null,
        updated_at: new Date().toISOString()
    };

    console.log('Saving user settings:', settingsToSave);

    try {
        const { data, error } = await supabase
            .from('user_settings')
            .upsert(settingsToSave, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Update user settings error:', error);
            return { success: false, error: `저장 실패: ${error.message}` };
        }

        console.log('Settings saved successfully:', data);
        return { success: true, data: data as UserSettings };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('Update user settings failed:', err);
        return { success: false, error: errorMessage };
    }
}

// 기본 설정값 (하드코딩)
export const DEFAULT_SUPABASE_URL = 'https://zxinmrrarkvgkvlgjhec.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aW5tcnJhcmt2Z2t2bGdqaGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDM5MjYsImV4cCI6MjA4MzAxOTkyNn0.UdrSHWF3MEEIbwYmIyIx8bKpve6clwxoWOGoGI3odT4';

