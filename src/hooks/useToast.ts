import { useState, useCallback } from 'react';
import type { ToastMessage } from '../types';

/**
 * 토스트 알림 관리 훅
 */
export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((
        type: ToastMessage['type'],
        message: string,
        duration: number = 3000
    ) => {
        const id = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const newToast: ToastMessage = { id, type, message };

        setToasts((prev) => [...prev, newToast]);

        // 자동 제거
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message: string) => addToast('success', message), [addToast]);
    const error = useCallback((message: string) => addToast('error', message), [addToast]);
    const warning = useCallback((message: string) => addToast('warning', message), [addToast]);
    const info = useCallback((message: string) => addToast('info', message), [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };
}
