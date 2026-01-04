import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalyzedReceipt } from '../types';

// 기본 API 키 (하드코딩)
export const DEFAULT_GEMINI_API_KEY = 'AIzaSyC1Fl9saLKOeFk2zS3zSTiGttmcXvmhgFc';

/**
 * 영수증 이미지 분석
 */
export async function analyzeReceipt(
    imageFile: File,
    apiKey?: string
): Promise<AnalyzedReceipt> {
    const key = apiKey || DEFAULT_GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    // 이미지를 Base64로 변환
    const imageData = await fileToBase64(imageFile);

    const prompt = `이 영수증 이미지를 분석해서 다음 정보를 JSON 형식으로 추출해주세요.
반드시 아래 형식의 JSON만 반환하고, 다른 텍스트는 포함하지 마세요.

{
  "date": "YYYY-MM-DD 형식의 날짜",
  "time": "HH:MM 형식의 시간 (없으면 null)",
  "store_name": "가게/상점 이름",
  "address": "주소 (없으면 null)",
  "amount": 총 금액 (숫자만, 원 단위)
}

주의사항:
- date는 반드시 YYYY-MM-DD 형식으로 (예: 2026-01-04)
- time은 HH:MM 형식으로 (예: 14:30)
- amount는 숫자만 (쉼표, 원 기호 제외)
- 영수증에서 읽을 수 없는 정보는 null로 설정
- 금액은 합계/총액/결제금액을 우선`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: imageFile.type,
                    data: imageData,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // JSON 추출 (```json ... ``` 형식 처리)
        let jsonStr = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        // JSON 직접 매칭
        const directMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (directMatch) {
            jsonStr = directMatch[0];
        }

        const parsed = JSON.parse(jsonStr);

        // 데이터 정제
        return {
            date: parsed.date || new Date().toISOString().split('T')[0],
            time: parsed.time || null,
            store_name: parsed.store_name || '알 수 없는 가게',
            address: parsed.address || null,
            amount: typeof parsed.amount === 'number'
                ? parsed.amount
                : parseInt(String(parsed.amount).replace(/[^\d]/g, ''), 10) || 0,
        };
    } catch (error: unknown) {
        console.error('Receipt analysis error:', error);

        // 에러 타입에 따른 상세 메시지
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();

            if (errorMessage.includes('api key') || errorMessage.includes('api_key')) {
                throw new Error('API 키가 유효하지 않습니다. 설정에서 Gemini API 키를 확인해주세요.');
            }
            if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            }
            if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                throw new Error('Gemini 모델을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
            }
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                throw new Error('네트워크 연결을 확인해주세요.');
            }

            // JSON 파싱 에러
            if (error.name === 'SyntaxError') {
                throw new Error('영수증 분석 결과를 처리할 수 없습니다. 다른 이미지를 시도해주세요.');
            }

            throw new Error(`영수증 분석 실패: ${error.message}`);
        }

        throw new Error('영수증 분석에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * File을 Base64 문자열로 변환
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // data:image/...;base64, 부분 제거
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
