import { format, isWithinInterval, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜가 지정된 범위 내에 있는지 확인
 */
export function isDateInRange(
    dateString: string,
    startDate: Date | null,
    endDate: Date | null
): boolean {
    if (!startDate || !endDate) return true; // 범위가 설정되지 않으면 항상 유효

    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return false;

        // 시작일과 종료일의 시간을 조정하여 날짜만 비교
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return isWithinInterval(date, { start, end });
    } catch {
        return false;
    }
}

/**
 * 날짜 범위를 "YYYY.MM.DD ~ YYYY.MM.DD" 형식으로 포맷
 */
export function formatDateRange(
    startDate: Date | null,
    endDate: Date | null
): string {
    if (!startDate || !endDate) {
        return '기간을 선택하세요';
    }

    const startFormatted = format(startDate, 'yyyy.MM.dd', { locale: ko });
    const endFormatted = format(endDate, 'yyyy.MM.dd', { locale: ko });

    return `${startFormatted} ~ ${endFormatted}`;
}

/**
 * 날짜 범위를 한국어로 표시 (경고 메시지용)
 */
export function formatDateRangeKorean(
    startDate: Date | null,
    endDate: Date | null
): string {
    if (!startDate || !endDate) {
        return '설정된 기간 없음';
    }

    const startFormatted = format(startDate, 'M월 d일', { locale: ko });
    const endFormatted = format(endDate, 'M월 d일', { locale: ko });

    return `${startFormatted}~${endFormatted}`;
}

/**
 * 날짜 문자열을 "YYYY.MM.DD" 형식으로 변환
 */
export function formatDate(dateString: string): string {
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return dateString;
        return format(date, 'yyyy.MM.dd', { locale: ko });
    } catch {
        return dateString;
    }
}

/**
 * 날짜 문자열을 "M월 D일 (요일)" 형식으로 변환
 */
export function formatDateWithDay(dateString: string): string {
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return dateString;
        return format(date, 'M월 d일 (EEE)', { locale: ko });
    } catch {
        return dateString;
    }
}

/**
 * 시간 문자열을 "HH:MM" 형식으로 변환
 */
export function formatTime(timeString: string | null): string {
    if (!timeString) return '';

    // HH:MM:SS 형식이면 HH:MM만 반환
    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        return `${parts[0]}:${parts[1]}`;
    }

    return timeString;
}

/**
 * Date 객체를 ISO 형식 날짜 문자열로 변환 (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}
