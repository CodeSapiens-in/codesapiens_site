-- ================================================================
-- FINAL FORM SETUP (Run this to fix all permissions)
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
CREATE TABLE IF NOT EXISTS public.program_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id text REFERENCES public.users(uid),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_mobile text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'submitted',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) FIXES
-- ================================================================

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_registrations ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (To prevent "policy already exists" errors or conflicts)
DROP POLICY IF EXISTS programs_select_all ON public.programs;
DROP POLICY IF EXISTS programs_select_active ON public.programs; -- Drop potentially old named policy
DROP POLICY IF EXISTS programs_all_admin ON public.programs;

DROP POLICY IF EXISTS program_registrations_insert_auth ON public.program_registrations;
DROP POLICY IF EXISTS program_registrations_select_own ON public.program_registrations;
DROP POLICY IF EXISTS program_registrations_all_admin ON public.program_registrations;


-- 4. RE-CREATE POLICIES

-- Programs: Public Read Access (Critical for "No Auth" view)
CREATE POLICY programs_select_all ON public.programs 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Programs: Admin Full Access
CREATE POLICY programs_all_admin ON public.programs 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin());


-- Registrations: Authenticated users can submit
CREATE POLICY program_registrations_insert_auth ON public.program_registrations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Registrations: Users see own matches
CREATE POLICY program_registrations_select_own ON public.program_registrations 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid()::text);

-- Registrations: Admins see all
CREATE POLICY program_registrations_all_admin ON public.program_registrations 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin());

