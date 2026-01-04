-- ============================================
-- Supabase 설정 SQL
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================

-- 1. expenses 테이블 생성
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TIME,
    store_name TEXT NOT NULL,
    address TEXT,
    amount INTEGER NOT NULL,
    category TEXT DEFAULT '기타',
    image_url TEXT,
    user_id TEXT DEFAULT 'default_user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security 활성화
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 3. 모든 사용자가 읽기/쓰기 가능하도록 정책 생성 (개발용)
CREATE POLICY "Allow all operations" ON expenses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Storage 버킷 설정 (Dashboard에서 수동으로 설정 필요)
-- ============================================
-- 1. Supabase Dashboard > Storage 메뉴로 이동
-- 2. "New bucket" 클릭
-- 3. 버킷 이름: receipts
-- 4. Public bucket: 활성화 (체크)
-- 5. "Create bucket" 클릭
--
-- 그 후 아래 SQL을 실행하여 스토리지 정책 설정:

-- Storage 정책 (버킷 생성 후 실행)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', true)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Allow public uploads" ON storage.objects
--     FOR INSERT
--     WITH CHECK (bucket_id = 'receipts');

-- CREATE POLICY "Allow public reads" ON storage.objects
--     FOR SELECT
--     USING (bucket_id = 'receipts');

-- CREATE POLICY "Allow public updates" ON storage.objects
--     FOR UPDATE
--     USING (bucket_id = 'receipts');

-- CREATE POLICY "Allow public deletes" ON storage.objects
--     FOR DELETE
--     USING (bucket_id = 'receipts');
