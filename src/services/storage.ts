import { getSupabaseClient } from './supabase';

/**
 * 이미지를 Supabase Storage에 업로드
 */
export async function uploadImage(file: File): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase가 초기화되지 않았습니다.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('이미지 업로드에 실패했습니다.');
    }

    const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * 이미지 삭제
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split('/receipts/');
    if (urlParts.length < 2) return;

    const filePath = `receipts/${urlParts[1]}`;

    const { error } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

    if (error) {
        console.error('Delete image error:', error);
    }
}
