export interface Expense {
    id: string;
    date: string; // YYYY-MM-DD
    time: string | null; // HH:MM
    store_name: string;
    address: string | null;
    amount: number;
    category: string;
    reason: string | null; // 지출 사유
    image_url: string | null;
    user_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserSettings {
    id?: string;
    user_id: string;
    budget: number;
    start_date: string | null; // YYYY-MM-DD
    end_date: string | null; // YYYY-MM-DD
    api_key_pin?: string; // 4자리 숫자 비밀번호
    gemini_api_key?: string; // Gemini API 키
    created_at?: string;
    updated_at?: string;
}

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

export interface AppSettings {
    supabaseUrl: string;
    supabaseKey: string;
    geminiApiKey: string;
    budget: number;
    dateRange: {
        startDate: string | null; // ISO string
        endDate: string | null;
    };
}

export interface AnalyzedReceipt {
    date: string; // YYYY-MM-DD
    time: string | null;
    store_name: string;
    address: string | null;
    amount: number;
}

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}
