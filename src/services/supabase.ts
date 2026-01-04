import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
 * Supabase 연결 테스트
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

// 기본 설정값 (하드코딩)
export const DEFAULT_SUPABASE_URL = 'https://zxinmrrarkvgkvlgjhec.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aW5tcnJhcmt2Z2t2bGdqaGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDM5MjYsImV4cCI6MjA4MzAxOTkyNn0.UdrSHWF3MEEIbwYmIyIx8bKpve6clwxoWOGoGI3odT4';
