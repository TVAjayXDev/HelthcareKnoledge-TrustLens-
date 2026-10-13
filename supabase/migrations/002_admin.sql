-- ====================================================================
-- TrustLens Migration 002: Role-Based Admin Access, Governance & Audit
-- ====================================================================

-- 1. Add role column to profiles with check constraint ('user', 'admin')
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- 2. Security-Definer Function to check if calling user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 3. RLS Configuration for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies if any exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
END $$;

-- Policy: Authenticated users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Policy: Users can update their own non-role profile attributes
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Policy: Only Admins can update roles & any profile
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Lockdown documents, chunks, and storage writes (Service Role Only)
-- Drop existing broad write policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow server write documents" ON public.documents;
  DROP POLICY IF EXISTS "Allow server all chunks" ON public.chunks;
  DROP POLICY IF EXISTS "Allow storage access documents" ON storage.objects;
  DROP POLICY IF EXISTS "Allow server all questions_log" ON public.questions_log;
END $$;

-- Public read policies (public & clinicians can read published policy documents and chunks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read documents' AND tablename = 'documents') THEN
    CREATE POLICY "Allow public read documents" ON public.documents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read chunks' AND tablename = 'chunks') THEN
    CREATE POLICY "Allow public read chunks" ON public.chunks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read questions_log' AND tablename = 'questions_log') THEN
    CREATE POLICY "Allow public read questions_log" ON public.questions_log FOR SELECT USING (true);
  END IF;
END $$;

-- Note: No client INSERT/UPDATE/DELETE policies are created for documents, chunks, or storage.objects.
-- All database & storage writes execute exclusively server-side via SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS safely and deterministically.

-- Storage: Allow public read of documents if needed, but writes are service role only
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow read storage documents" ON storage.objects;
  CREATE POLICY "Allow read storage documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');
END $$;

-- 5. Add knowledge gap tracking columns to questions_log
ALTER TABLE public.questions_log 
ADD COLUMN IF NOT EXISTS gap_status TEXT NOT NULL DEFAULT 'open' 
CHECK (gap_status IN ('open', 'resolved'));

ALTER TABLE public.questions_log 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

ALTER TABLE public.questions_log 
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_questions_log_gap ON public.questions_log(gap_status, status);

-- 6. Create admin_audit_log table (server-only write/read)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,                  -- 'document_upload' | 'document_update' | 'document_delete' | 'gap_resolve' | 'user_role_change'
  target TEXT,                           -- e.g. 'DOC-ID', 'user_email', or 'gap_id'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- No client policies created for admin_audit_log: read and written solely via server service-role client.

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON public.admin_audit_log(actor_id);

-- 7. One-line SQL to promote your account to the first admin (edit with your email):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';
-- Example:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'tvajay0@gmail.com';
