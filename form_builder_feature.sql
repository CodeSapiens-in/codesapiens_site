-- ================================================================
-- FORMS & PROGRAMS FEATURE (Standalone SQL)
-- ================================================================

-- 1. Programs Table (Admin Created Forms)
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Program Registrations Table (User Submissions)
CREATE TABLE IF NOT EXISTS public.program_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id text REFERENCES public.users(uid),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'submitted',
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- ROW LEVEL SECURITY & POLICIES
-- ================================================================

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_registrations ENABLE ROW LEVEL SECURITY;

-- Programs Policies
DO $$
BEGIN
  -- Allow everyone (including anon) to view active programs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'programs' AND policyname = 'programs_select_all') THEN
    CREATE POLICY programs_select_all ON public.programs FOR SELECT TO anon, authenticated USING (true);
  END IF;

  -- Allow admins full access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'programs' AND policyname = 'programs_all_admin') THEN
    CREATE POLICY programs_all_admin ON public.programs FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Program Registrations Policies
DO $$
BEGIN
  -- Allow authenticated users to submit forms
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'program_registrations' AND policyname = 'program_registrations_insert_auth') THEN
    CREATE POLICY program_registrations_insert_auth ON public.program_registrations FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  -- Allow users to view their own submissions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'program_registrations' AND policyname = 'program_registrations_select_own') THEN
    CREATE POLICY program_registrations_select_own ON public.program_registrations FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
  END IF;

  -- Allow admins full access to submissions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'program_registrations' AND policyname = 'program_registrations_all_admin') THEN
    CREATE POLICY program_registrations_all_admin ON public.program_registrations FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END$$;
