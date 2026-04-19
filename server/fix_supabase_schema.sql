-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- Paste this entire block and click "Run"
-- ============================================

-- 1. Fix user_id columns: Change from UUID to TEXT (Firebase UIDs are strings)
ALTER TABLE waste_scans ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE chat_messages ALTER COLUMN user_id TYPE TEXT;

-- 2. Disable Row Level Security (RLS) so your server can insert data freely
-- (For production, you'd create proper policies instead)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE waste_scans DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- 3. Grant full access to the anon role (used by your API key)
GRANT ALL ON users TO anon;
GRANT ALL ON waste_scans TO anon;
GRANT ALL ON chat_messages TO anon;
