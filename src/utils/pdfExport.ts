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
 * HTML 요소를 캔버스로 변환하여 PDF에 추가
 */
async function addHtmlToPdf(
  pdf: jsPDF,
  htmlContent: string,
  addNewPage: boolean = true
): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.backgroundColor = 'white';
  container.style.padding = '40px';
  container.style.fontFamily = 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  container.innerHTML = htmlContent;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    if (addNewPage) {
      pdf.addPage();
    }

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 지출 내역을 PDF로 내보내기
 */
export async function exportToPdf(
  expenses: Expense[],
  dateRange: DateRange,
  totalBudget: number
): Promise<void> {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;

  const startDateStr = dateRange.startDate
    ? format(dateRange.startDate, 'yyyy.MM.dd', { locale: ko })
    : '';
  const endDateStr = dateRange.endDate
    ? format(dateRange.endDate, 'yyyy.MM.dd', { locale: ko })
    : '';

  // 메인 보고서 HTML
  const mainReportHtml = `
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
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0;">날짜</th>
          <th style="padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0;">시간</th>
          <th style="padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0;">가게명</th>
          <th style="padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0;">주소</th>
          <th style="padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0;">카테고리</th>
          <th style="padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0;">지출 사유</th>
          <th style="padding: 8px 6px; text-align: right; border-bottom: 1px solid #e2e8f0;">금액</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.map((expense, index) => `
          <tr style="background: ${index % 2 === 0 ? 'white' : '#fafafa'};">
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${formatDate(expense.date)}</td>
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${formatTime(expense.time) || '-'}</td>
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${expense.store_name}</td>
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">${expense.address || '-'}</td>
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0;">
              <span style="display: inline-block; padding: 2px 6px; background: ${getCategoryColor(expense.category)}20; color: ${getCategoryColor(expense.category)}; border-radius: 4px; font-size: 10px;">
                ${expense.category}
              </span>
            </td>
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">${expense.reason || '-'}</td>
            <td style="padding: 8px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; white-space: nowrap;">
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

  // PDF 생성 시작
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.backgroundColor = 'white';
  container.style.padding = '40px';
  container.style.fontFamily = 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  container.innerHTML = mainReportHtml;

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

    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);

    // 영수증 이미지가 있는 지출들 필터링
    const expensesWithReceipts = expenses.filter(e => e.image_url);

    if (expensesWithReceipts.length > 0) {
      // 영수증 첨부 표지 (html2canvas 사용)
      const coverHtml = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 400px;">
                    <h1 style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">
                        영수증 첨부
                    </h1>
                    <p style="font-size: 18px; color: #64748b; margin: 0;">
                        총 ${expensesWithReceipts.length}건의 영수증
                    </p>
                </div>
            `;
      await addHtmlToPdf(pdf, coverHtml, true);

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
 * 영수증 이미지를 PDF에 추가 (2열 레이아웃, html2canvas로 라벨 렌더링)
 */
async function addReceiptPages(pdf: jsPDF, expenses: Expense[]): Promise<void> {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const gap = 8;
  const labelHeight = 8; // 라벨 높이 (mm)
  const colWidth = (pageWidth - margin * 2 - gap) / 2;
  const maxImgHeight = (pageHeight - margin * 2 - gap - labelHeight * 2) / 2 - 10;

  let positionInPage = 0;

  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];
    if (!expense.image_url) continue;

    const base64 = await fetchImageAsBase64(expense.image_url);
    if (!base64) continue;

    const dimensions = await getImageDimensions(base64);
    if (dimensions.width === 0) continue;

    // 새 페이지 필요 여부 확인
    if (positionInPage === 0 || positionInPage >= 4) {
      pdf.addPage();
      positionInPage = 0;
    }

    // 위치 계산 (2x2 그리드)
    const col = positionInPage % 2;
    const row = Math.floor(positionInPage / 2);
    const x = margin + col * (colWidth + gap);
    const y = margin + row * (maxImgHeight + labelHeight + gap);

    // 라벨을 html2canvas로 렌더링
    const labelText = `${formatDate(expense.date)} ${formatTime(expense.time) || ''} - ${expense.store_name}`;
    const displayText = labelText.length > 35 ? labelText.slice(0, 35) + '...' : labelText;
    const labelHtml = `
            <div style="width: ${colWidth * 3.78}px; padding: 2px 0; font-family: Pretendard, -apple-system, sans-serif; line-height: 1.4;">
                <p style="margin: 0; font-size: 10px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${displayText}
                </p>
            </div>
        `;

    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.left = '-9999px';
    labelContainer.style.top = '0';
    labelContainer.style.backgroundColor = 'white';
    labelContainer.innerHTML = labelHtml;
    document.body.appendChild(labelContainer);

    try {
      const labelCanvas = await html2canvas(labelContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const labelImgData = labelCanvas.toDataURL('image/png');
      const labelImgWidth = colWidth;
      const labelImgHeight = (labelCanvas.height / labelCanvas.width) * labelImgWidth;
      // 라벨 이미지는 원본 비율 유지 (잘림 방지)
      pdf.addImage(labelImgData, 'PNG', x, y, labelImgWidth, labelImgHeight);
    } catch (err) {
      console.error('Failed to render label:', err);
    } finally {
      document.body.removeChild(labelContainer);
    }

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
