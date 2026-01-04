/**
 * 숫자를 원화 형식으로 포맷 (₩1,234,567)
 */
export function formatCurrency(amount: number): string {
    return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * 문자열에서 숫자만 추출
 */
export function extractNumber(str: string): number {
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

/**
 * 문자열을 원화 형식으로 변환 (입력 중)
 */
export function formatCurrencyInput(value: string): string {
    const number = extractNumber(value);
    if (number === 0) return '';
    return number.toLocaleString('ko-KR');
}

/**
 * 카테고리별 색상 반환
 */
export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        '식비': '#10B981',      // Emerald
        '교통': '#3B82F6',      // Blue
        '쇼핑': '#F59E0B',      // Amber
        '의료': '#EF4444',      // Red
        '문화': '#8B5CF6',      // Purple
        '교육': '#06B6D4',      // Cyan
        '공과금': '#6366F1',    // Indigo
        '기타': '#64748B',      // Slate
    };
    return colors[category] || colors['기타'];
}

/**
 * 카테고리 목록
 */
export const CATEGORIES = [
    '식비',
    '교통',
    '쇼핑',
    '의료',
    '문화',
    '교육',
    '공과금',
    '기타',
];

/**
 * 텍스트 줄임 처리
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
