import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Expense, DateRange } from '../types';
import { formatCurrency, getCategoryColor } from './formatUtils';
import { formatDate, formatTime } from './dateUtils';

/**
 * 이미지 URL에서 base64 데이터를 가져오기
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to fetch image:', err);
    return null;
  }
}

/**
 * 이미지의 실제 크기를 가져오기
 */
async function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = base64;
  });
}

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
    
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">날짜</th>
          <th style="padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">시간</th>
          <th style="padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">가게명</th>
          <th style="padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; max-width: 150px;">주소</th>
          <th style="padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">카테고리</th>
          <th style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">금액</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.map((expense, index) => `
          <tr style="background: ${index % 2 === 0 ? 'white' : '#fafafa'};">
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${formatDate(expense.date)}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${formatTime(expense.time) || '-'}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${expense.store_name}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">${expense.address || '-'}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">
              <span style="display: inline-block; padding: 2px 8px; background: ${getCategoryColor(expense.category)}20; color: ${getCategoryColor(expense.category)}; border-radius: 4px; font-size: 11px;">
                ${expense.category}
              </span>
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; white-space: nowrap;">
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

    // 영수증 이미지가 있는 지출들 필터링
    const expensesWithReceipts = expenses.filter(e => e.image_url);

    if (expensesWithReceipts.length > 0) {
      // 영수증 이미지 페이지 추가
      await addReceiptPages(pdf, expensesWithReceipts);
    }

    const fileName = `지출내역_${startDateStr}_${endDateStr}.pdf`.replace(/\./g, '');
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 영수증 이미지를 PDF에 추가 (2열 레이아웃)
 */
async function addReceiptPages(pdf: jsPDF, expenses: Expense[]): Promise<void> {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15; // 여백
  const gap = 10; // 이미지 간 간격
  const labelHeight = 20; // 날짜/시간 라벨 높이
  const colWidth = (pageWidth - margin * 2 - gap) / 2; // 2열
  const maxImgHeight = (pageHeight - margin * 2 - gap - labelHeight * 2) / 2; // 2행

  // 영수증 섹션 표지 추가
  pdf.addPage();
  pdf.setFontSize(20);
  pdf.setTextColor(15, 23, 42);
  pdf.text('영수증 첨부', pageWidth / 2, 40, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`총 ${expenses.length}건의 영수증`, pageWidth / 2, 55, { align: 'center' });

  // 이미지 로딩 및 배치
  let currentPage = 0;
  let positionInPage = 0; // 0-3 (2x2 그리드)

  for (const expense of expenses) {
    if (!expense.image_url) continue;

    const base64 = await fetchImageAsBase64(expense.image_url);
    if (!base64) continue;

    const dimensions = await getImageDimensions(base64);
    if (dimensions.width === 0) continue;

    // 새 페이지 필요 여부 확인
    if (positionInPage === 0 || positionInPage >= 4) {
      pdf.addPage();
      currentPage++;
      positionInPage = 0;
    }

    // 위치 계산 (2x2 그리드)
    const col = positionInPage % 2;
    const row = Math.floor(positionInPage / 2);
    const x = margin + col * (colWidth + gap);
    const y = margin + row * (maxImgHeight + labelHeight + gap);

    // 날짜/시간 라벨 추가
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    const label = `${formatDate(expense.date)} ${formatTime(expense.time) || ''} - ${expense.store_name}`;
    pdf.text(label.slice(0, 40) + (label.length > 40 ? '...' : ''), x, y + 5);

    // 이미지 크기 계산 (비율 유지, 영역 내 맞춤)
    const aspectRatio = dimensions.width / dimensions.height;
    let imgWidth = colWidth;
    let imgHeight = imgWidth / aspectRatio;

    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = imgHeight * aspectRatio;
    }

    // 이미지 중앙 정렬
    const imgX = x + (colWidth - imgWidth) / 2;
    const imgY = y + labelHeight;

    try {
      pdf.addImage(base64, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    } catch (err) {
      console.error('Failed to add image to PDF:', err);
    }

    positionInPage++;
  }
}

