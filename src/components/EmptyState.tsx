import { Receipt, ArrowUp } from 'lucide-react';

interface EmptyStateProps {
    message?: string;
    subMessage?: string;
}

export function EmptyState({
    message = '아직 등록된 지출이 없습니다',
    subMessage = '영수증을 촬영하거나 갤러리에서 선택하여 지출 내역을 추가해보세요!'
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Illustration */}
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Receipt className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center animate-bounce">
                    <ArrowUp className="w-4 h-4 text-success" />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-subtitle text-text-primary mb-2">
                {message}
            </h3>

            {/* Description */}
            <p className="text-body text-text-secondary text-center max-w-xs">
                {subMessage}
            </p>
        </div>
    );
}

