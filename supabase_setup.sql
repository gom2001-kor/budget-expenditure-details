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

-- 3. 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Allow all operations" ON expenses;
DROP POLICY IF EXISTS "Allow public select" ON expenses;
DROP POLICY IF EXISTS "Allow public insert" ON expenses;
DROP POLICY IF EXISTS "Allow public update" ON expenses;
DROP POLICY IF EXISTS "Allow public delete" ON expenses;

-- 4. 모든 사용자가 읽기/쓰기 가능하도록 정책 생성 (개발용)
-- 방법 1: 단일 정책으로 모든 작업 허용
CREATE POLICY "Allow all operations" ON expenses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 방법 2: (위 정책이 안 되면 아래 개별 정책 사용)
-- CREATE POLICY "Allow public select" ON expenses FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON expenses FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON expenses FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow public delete" ON expenses FOR DELETE USING (true);

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 정책 문제 해결용 SQL (데이터가 저장되지 않을 때 실행)
-- ============================================
-- 아래 SQL을 별도로 실행하면 RLS를 완전히 비활성화합니다.
-- 주의: 보안상 개발/테스트 용도로만 사용하세요.

-- ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

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

