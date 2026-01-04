import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Expense, DateRange } from '../types';
import { formatCurrency, getCategoryColor } from './formatUtils';
import { formatDate, formatTime } from './dateUtils';

/**
 * 지출 내역을 PDF로 내보내기
 */
export async function exportToPdf(
    expenses: Expense[],
    dateRange: DateRange,
    totalBudget: number
): Promise<void> {
    // 임시 컨테이너 생성
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width at 96dpi
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.fontFamily = 'Pretendard, sans-serif';

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalBudget - totalSpent;

    const startDateStr = dateRange.startDate
        ? format(dateRange.startDate, 'yyyy.MM.dd', { locale: ko })
        : '';
    const endDateStr = dateRange.endDate
        ? format(dateRange.endDate, 'yyyy.MM.dd', { locale: ko })
        : '';

    container.innerHTML = `
    <div style="margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">
        지출 내역 보고서
      </h1>
      <p style="font-size: 14px; color: #64748b; margin: 0;">
        ${startDateStr} ~ ${endDateStr}
      </p>
    </div>
    
    <div style="display: flex; gap: 20px; margin-bottom: 30px;">
      <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 20px;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 4px 0;">총 예산</p>
        <p style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">
          ${formatCurrency(totalBudget)}
        </p>
      </div>
      <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 20px;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 4px 0;">총 지출</p>
        <p style="font-size: 24px; font-weight: 700; color: #ef4444; margin: 0;">
          ${formatCurrency(totalSpent)}
        </p>
      </div>
      <div style="flex: 1; background: ${remaining >= 0 ? '#ecfdf5' : '#fef2f2'}; border-radius: 12px; padding: 20px;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 4px 0;">잔액</p>
        <p style="font-size: 24px; font-weight: 700; color: ${remaining >= 0 ? '#10b981' : '#ef4444'}; margin: 0;">
          ${formatCurrency(remaining)}
        </p>
      </div>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">날짜</th>
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">시간</th>
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">가게명</th>
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">카테고리</th>
          <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">금액</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.map((expense, index) => `
          <tr style="background: ${index % 2 === 0 ? 'white' : '#fafafa'};">
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${formatDate(expense.date)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${formatTime(expense.time)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${expense.store_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              <span style="display: inline-block; padding: 2px 8px; background: ${getCategoryColor(expense.category)}20; color: ${getCategoryColor(expense.category)}; border-radius: 4px; font-size: 12px;">
                ${expense.category}
              </span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">
              ${formatCurrency(expense.amount)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
      생성일: ${format(new Date(), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
    </div>
  `;

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

        const fileName = `지출내역_${startDateStr}_${endDateStr}.pdf`.replace(/\./g, '');
        pdf.save(fileName);
    } finally {
        document.body.removeChild(container);
    }
}
