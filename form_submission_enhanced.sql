-- ================================================================
-- ADVANCED FORM SUBMISSION SCHEMA
-- ================================================================

-- 1. Ensure Programs Table Exists
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

-- 2. Enhanced Program Registrations Table
-- (Dropping if exists to apply new structure cleanly)
DROP TABLE IF EXISTS public.program_registrations;

CREATE TABLE public.program_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id text REFERENCES public.users(uid),
  
  -- [NEW] Captured User Details
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_mobile text, -- Can be NULL if not collected, but UI will force it
  
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'submitted',
  
  submitted_at timestamptz DEFAULT now(), -- Explicit submission time
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- POLICIES
-- ================================================================

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_registrations ENABLE ROW LEVEL SECURITY;

-- Programs Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'programs' AND policyname = 'programs_select_all') THEN
    CREATE POLICY programs_select_all ON public.programs FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'programs' AND policyname = 'programs_all_admin') THEN
    CREATE POLICY programs_all_admin ON public.programs FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Program Registrations Policies
DO $$
BEGIN
  -- Insert: Allow authenticated users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'program_registrations' AND policyname = 'program_registrations_insert_auth') THEN
    CREATE POLICY program_registrations_insert_auth ON public.program_registrations FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  -- Select: Users see their own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'program_registrations' AND policyname = 'program_registrations_select_own') THEN
    CREATE POLICY program_registrations_select_own ON public.program_registrations FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
  END IF;

  -- Select: Admins see all
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'program_registrations' AND policyname = 'program_registrations_all_admin') THEN
    CREATE POLICY program_registrations_all_admin ON public.program_registrations FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END$$;
