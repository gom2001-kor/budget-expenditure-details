export interface Expense {
    id: string;
    date: string; // YYYY-MM-DD
    time: string | null; // HH:MM
    store_name: string;
    address: string | null;
    amount: number;
    category: string;
    image_url: string | null;
    user_id: string;
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
