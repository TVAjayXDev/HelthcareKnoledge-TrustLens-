-- ====================================================================
-- TrustLens: Complete Unified Supabase Setup (Single Note)
-- ====================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Documents table (Clinical Policies, Statutes, Guidelines, SOPs)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  tier INT CHECK (tier BETWEEN 1 AND 5),
  doc_type TEXT NOT NULL,
  owner TEXT,
  approver TEXT,
  department TEXT NOT NULL,
  payer TEXT,
  effective_date TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  freshness TEXT DEFAULT 'current',
  days_overdue INT DEFAULT 0,
  newer_version_id TEXT,
  file_url TEXT,
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure newer_version_id column exists if table was previously created
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS newer_version_id TEXT;

-- 3. Chunks table with 768-dimension vector embeddings
CREATE TABLE IF NOT EXISTS public.chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  section TEXT NOT NULL,
  page INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Questions and Clinical Governance Audit Log
CREATE TABLE IF NOT EXISTS public.questions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL,                  -- 'answered' | 'conflict' | 'no_answer'
  confidence_level TEXT,                 -- 'high' | 'medium' | 'low' | 'none'
  confidence_reason TEXT,
  claims JSONB DEFAULT '[]'::jsonb,
  citations JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  conflict JSONB,
  closest_documents JSONB DEFAULT '[]'::jsonb,
  gap_logged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Match Chunks Vector Cosine Similarity Function
CREATE OR REPLACE FUNCTION public.match_chunks (
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.0,
  match_count INT DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  document_id TEXT,
  chunk_index INT,
  section TEXT,
  page INT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.document_id,
    chunks.chunk_index,
    chunks.section,
    chunks.page,
    chunks.content,
    (1 - (chunks.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.chunks
  WHERE (1 - (chunks.embedding <=> query_embedding)) >= match_threshold
  ORDER BY chunks.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- 6. Storage Bucket for PDF Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 52428800, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO NOTHING;

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON public.chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON public.chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_questions_log_created ON public.questions_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_log_user ON public.questions_log(user_id);

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions_log ENABLE ROW LEVEL SECURITY;

-- Documents Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read documents' AND tablename = 'documents') THEN
    CREATE POLICY "Allow public read documents" ON public.documents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow server write documents' AND tablename = 'documents') THEN
    CREATE POLICY "Allow server write documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Chunks Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow server all chunks' AND tablename = 'chunks') THEN
    CREATE POLICY "Allow server all chunks" ON public.chunks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Questions Log Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow server all questions_log' AND tablename = 'questions_log') THEN
    CREATE POLICY "Allow server all questions_log" ON public.questions_log FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Storage Bucket Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow storage access documents' AND tablename = 'objects') THEN
    CREATE POLICY "Allow storage access documents" ON storage.objects FOR ALL USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
  END IF;
END $$;
