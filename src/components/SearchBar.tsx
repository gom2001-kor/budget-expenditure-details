import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onAdvancedSearch: () => void;
    hasActiveFilters?: boolean;
}

export function SearchBar({
    value,
    onChange,
    onAdvancedSearch,
    hasActiveFilters = false,
}: SearchBarProps) {
    return (
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
            <div className="flex gap-2">
                {/* Basic Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="가게명, 주소, 지출 사유로 검색..."
                        className="
                            w-full h-11 pl-10 pr-10 rounded-xl
                            border border-border bg-gray-50
                            focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white
                            transition-all text-sm
                        "
                    />
                    {value && (
                        <button
                            onClick={() => onChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="검색어 지우기"
                        >
                            <X className="w-4 h-4 text-text-secondary" />
                        </button>
                    )}
                </div>

                {/* Advanced Search Button */}
                <button
                    onClick={onAdvancedSearch}
                    className={`
                        relative flex items-center gap-2 px-4 h-11 rounded-xl
                        border-2 font-medium text-sm
                        transition-all active:scale-95
                        ${hasActiveFilters
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-text-secondary hover:border-primary hover:text-primary'
                        }
                    `}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">상세검색</span>
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                    )}
                </button>
            </div>
        </div>
    );
}
