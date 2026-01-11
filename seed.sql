-- ================================================================
-- Supabase Application Seed (Reordered for Dependencies)
-- ================================================================

-- ================================================================
-- 1. Extensions
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================================
-- 2. Helper Functions (No Dependencies)
-- ================================================================
CREATE OR REPLACE FUNCTION public.random_token(prefix text)
RETURNS text LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN prefix || '_' || substr(md5(gen_random_uuid()::text || clock_timestamp()::text),1,16);
END;
$$;

-- ================================================================
-- 3. Database Schema (Tables)
-- ================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  uid text PRIMARY KEY, -- References auth.users(id)
  display_name text,
  email text UNIQUE,
  phone_number text,
  avatar text,
  bio text,
  college text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  skills text[],
  role text DEFAULT 'student' CHECK (role = ANY (ARRAY['student','admin','mentor'])),
  badges_earned integer DEFAULT 0,
  points integer DEFAULT 0,
  sessions_attended integer DEFAULT 0,
  volunteering_hours integer DEFAULT 0,
  admin_approved boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  department text,
  major text,
  year integer,
  resume_url text,
  mentorship_request jsonb DEFAULT '[]'::jsonb,
  username text UNIQUE,
  is_public boolean DEFAULT false,
  attended_meetups jsonb DEFAULT '[]'::jsonb,
  last_feedback_at timestamptz -- Added from previous ADD COLUMN
);

-- Meetup Table
CREATE TABLE IF NOT EXISTS public.meetup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (TRIM(BOTH FROM title) <> ''),
  description text,
  start_date_time timestamptz,
  end_date_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  created_by uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  venue text,
  registration_start_time timestamptz,
  registration_end_time timestamptz,
  registration_open_until_meetup_end boolean DEFAULT false
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid REFERENCES public.meetup(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  user_phone text,
  token text UNIQUE DEFAULT public.random_token('tok'),
  is_checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  user_id text REFERENCES public.users(uid),
  status text DEFAULT 'pending'
);

-- Mentorship Programs Table
CREATE TABLE IF NOT EXISTS public.mentorship_programs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  description text,
  image_url text,
  start_date timestamptz,
  end_date timestamptz,
  registration_open_date timestamptz,
  registration_close_date timestamptz,
  status text DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft','published','archived'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mentorship Weeks Table
CREATE TABLE IF NOT EXISTS public.mentorship_weeks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id uuid,
  week_number integer,
  title text,
  content jsonb,
  submission_open_date timestamptz,
  submission_close_date timestamptz,
  is_submission_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (program_id) REFERENCES public.mentorship_programs(id)
);

-- Mentorship Registrations Table
CREATE TABLE IF NOT EXISTS public.mentorship_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  program_id uuid,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','approved','rejected','completed'])),
  answers jsonb,
  created_at timestamptz DEFAULT now(),
  team_id uuid,
  role text DEFAULT 'member',
  invitation_status text DEFAULT 'accepted',
  FOREIGN KEY (program_id) REFERENCES public.mentorship_programs(id)
);

-- Mentorship Submissions Table
CREATE TABLE IF NOT EXISTS public.mentorship_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id uuid,
  week_id uuid,
  user_id uuid,
  content jsonb,
  feedback text,
  score integer,
  status text DEFAULT 'submitted' CHECK (status = ANY (ARRAY['submitted','reviewed'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (registration_id) REFERENCES public.mentorship_registrations(id)
);

-- Mentorship Teams Table
CREATE TABLE IF NOT EXISTS public.mentorship_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  leader_id uuid,
  program_id uuid,
  created_at timestamptz DEFAULT timezone('utc', now()),
  FOREIGN KEY (leader_id) REFERENCES auth.users(id),
  FOREIGN KEY (program_id) REFERENCES public.mentorship_programs(id)
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar,
  slug varchar UNIQUE,
  excerpt text,
  content text,
  cover_image text,
  author_id text,
  status varchar DEFAULT 'draft' CHECK (status::text = ANY (ARRAY['draft','published']::text[])),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (author_id) REFERENCES public.users(uid)
);

-- Hall of Fame Table
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  student_name text,
  description text,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Community Photos Table
CREATE TABLE IF NOT EXISTS public.community_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  date text,
  description text,
  participants integer DEFAULT 0,
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(uid),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User Solved Problems Table
CREATE TABLE IF NOT EXISTS public.user_solved_problems (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  question_id integer NOT NULL,
  solved_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_solved_problems_pkey PRIMARY KEY (id),
  CONSTRAINT user_solved_problems_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid),
  CONSTRAINT unique_user_question UNIQUE (user_id, question_id)
);

-- ================================================================
-- 4. Indexes
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_public_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_public_registrations_meetup ON public.registrations(meetup_id);

-- ================================================================
-- 5. Row-Level Security (RLS) Enable
-- ================================================================
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meetup ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_solved_problems ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 6. Functions (Logic)
-- ================================================================

-- Function: Get User by Username
CREATE OR REPLACE FUNCTION public.get_user_by_username(lookup_username text)
RETURNS TABLE (uid text, username text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.uid, u.username
    FROM public.users u
    WHERE u.username = lookup_username;
END;
$$;

-- Function: Handle New User (Trigger logic)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    uid, email, display_name, role, email_verified,
    phone_verified, badges_earned, points, sessions_attended,
    volunteering_hours, admin_approved, skills, bio, college,
    github_url, linkedin_url, portfolio_url, avatar, phone_number,
    department, major, year
  )
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'displayName', ''),
    'student',
    FALSE,
    FALSE,
    0,
    0,
    0,
    0,
    FALSE,
    ARRAY[]::text[],
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    NULL,
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE uid = auth.uid()::text 
    AND role = 'admin'
  );
$$;

-- Function: Prevent Role Change
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'You are not allowed to change the role column directly.';
  END IF;
  RETURN NEW;
END;
$$;

-- Function: Handle Updated At (Generic)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: Update Blog Updated At
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: Update User Updated At (alias)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: Broadcast Room Messages
CREATE OR REPLACE FUNCTION public.room_messages_broadcast_trigger()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  rec := COALESCE(NEW, OLD);
  PERFORM realtime.broadcast_changes(
    'room:' || (rec.id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. Triggers
-- ================================================================

-- Trigger: On Auth User Created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Check Role Update
DROP TRIGGER IF EXISTS check_role_update ON public.users;
CREATE TRIGGER check_role_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- Trigger: Set Updated At (Users)
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Handle Blog Updated At
DROP TRIGGER IF EXISTS handle_blog_updated_at ON public.blogs;
CREATE TRIGGER handle_blog_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_updated_at();

-- Trigger: Handle User Updated At (Second trigger on users)
DROP TRIGGER IF EXISTS handle_user_updated_at ON public.users;
CREATE TRIGGER handle_user_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- 8. Policies
-- ================================================================

-- Blogs Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_select_published') THEN
    CREATE POLICY blogs_select_published ON public.blogs FOR SELECT TO anon, authenticated USING (status = 'published');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_select_admin') THEN
    CREATE POLICY blogs_select_admin ON public.blogs FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_insert_admin') THEN
    CREATE POLICY blogs_insert_admin ON public.blogs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_update_admin') THEN
    CREATE POLICY blogs_update_admin ON public.blogs FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_delete_admin') THEN
    CREATE POLICY blogs_delete_admin ON public.blogs FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Registrations Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'registrations' AND policyname = 'registrations_insert_own') THEN
    CREATE POLICY registrations_insert_own ON public.registrations FOR INSERT TO authenticated WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()::text));
  END IF;

  -- [NEW] Allow anonymous inserts for public meetup registration
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'registrations' AND policyname = 'registrations_insert_anon') THEN
    CREATE POLICY registrations_insert_anon ON public.registrations FOR INSERT TO anon WITH CHECK (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'registrations' AND policyname = 'registrations_select_owner') THEN
    CREATE POLICY registrations_select_owner ON public.registrations FOR SELECT TO authenticated USING (user_id = auth.uid()::text OR user_email = (auth.jwt() ->> 'email'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'registrations' AND policyname = 'registrations_select_admin') THEN
    CREATE POLICY registrations_select_admin ON public.registrations FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'registrations' AND policyname = 'registrations_update_admin') THEN
    CREATE POLICY registrations_update_admin ON public.registrations FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Users Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_own') THEN
    CREATE POLICY users_select_own ON public.users FOR SELECT TO authenticated USING (uid = auth.uid()::text);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_own') THEN
    CREATE POLICY users_update_own ON public.users FOR UPDATE TO authenticated USING (uid = auth.uid()::text) WITH CHECK (uid = auth.uid()::text);
  END IF;
END$$;

-- Storage Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_objects_select') THEN
    CREATE POLICY storage_objects_select ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'user-uploads' AND (string_to_array(name, '/'))[1] = auth.uid()::text);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_objects_insert') THEN
    CREATE POLICY storage_objects_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-uploads' AND (string_to_array(name, '/'))[1] = auth.uid()::text);
  END IF;
END$$;

-- Hall of Fame Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hall_of_fame' AND policyname = 'hall_of_fame_select_all') THEN
    CREATE POLICY hall_of_fame_select_all ON public.hall_of_fame FOR SELECT TO anon, authenticated USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hall_of_fame' AND policyname = 'hall_of_fame_insert_admin') THEN
    CREATE POLICY hall_of_fame_insert_admin ON public.hall_of_fame FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hall_of_fame' AND policyname = 'hall_of_fame_update_admin') THEN
    CREATE POLICY hall_of_fame_update_admin ON public.hall_of_fame FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hall_of_fame' AND policyname = 'hall_of_fame_delete_admin') THEN
    CREATE POLICY hall_of_fame_delete_admin ON public.hall_of_fame FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Community Photos Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_photos' AND policyname = 'community_photos_select_all') THEN
    CREATE POLICY community_photos_select_all ON public.community_photos FOR SELECT TO anon, authenticated USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_photos' AND policyname = 'community_photos_insert_admin') THEN
    CREATE POLICY community_photos_insert_admin ON public.community_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_photos' AND policyname = 'community_photos_update_admin') THEN
    CREATE POLICY community_photos_update_admin ON public.community_photos FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_photos' AND policyname = 'community_photos_delete_admin') THEN
    CREATE POLICY community_photos_delete_admin ON public.community_photos FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Feedback Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_insert_own') THEN
    CREATE POLICY feedback_insert_own ON public.feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_select_admin') THEN
    CREATE POLICY feedback_select_admin ON public.feedback FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_select_own') THEN
    CREATE POLICY feedback_select_own ON public.feedback FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
  END IF;
END$$;

-- Meetup Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetup' AND policyname = 'meetup_select_all') THEN
    CREATE POLICY meetup_select_all ON public.meetup FOR SELECT TO anon, authenticated USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetup' AND policyname = 'meetup_insert_admin') THEN
    CREATE POLICY meetup_insert_admin ON public.meetup FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetup' AND policyname = 'meetup_update_admin') THEN
    CREATE POLICY meetup_update_admin ON public.meetup FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetup' AND policyname = 'meetup_delete_admin') THEN
    CREATE POLICY meetup_delete_admin ON public.meetup FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- User Solved Problems Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_solved_problems' AND policyname = 'Users can insert their own solved problems') THEN
    CREATE POLICY "Users can insert their own solved problems"
    ON public.user_solved_problems
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_solved_problems' AND policyname = 'Users can view their own solved problems') THEN
    CREATE POLICY "Users can view their own solved problems"
    ON public.user_solved_problems
    FOR SELECT
    USING (auth.uid()::text = user_id);
  END IF;
END$$;
-- Mentorship Registrations Policies
DO $$
BEGIN
  -- Allow authenticated users (team leaders) to insert registrations (including for others)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_registrations' AND policyname = 'mentorship_registrations_insert_authenticated') THEN
    CREATE POLICY mentorship_registrations_insert_authenticated ON public.mentorship_registrations FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  -- Users can view their own registrations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_registrations' AND policyname = 'mentorship_registrations_select_own') THEN
    CREATE POLICY mentorship_registrations_select_own ON public.mentorship_registrations FOR SELECT TO authenticated USING (user_id = auth.uid()::uuid);
  END IF;

  -- Users can update their own registrations (e.g. accept invite)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_registrations' AND policyname = 'mentorship_registrations_update_own') THEN
    CREATE POLICY mentorship_registrations_update_own ON public.mentorship_registrations FOR UPDATE TO authenticated USING (user_id = auth.uid()::uuid);
  END IF;

    -- Users can delete their own registrations (e.g. reject invite)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_registrations' AND policyname = 'mentorship_registrations_delete_own') THEN
    CREATE POLICY mentorship_registrations_delete_own ON public.mentorship_registrations FOR DELETE TO authenticated USING (user_id = auth.uid()::uuid);
  END IF;

  -- Admin Access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_registrations' AND policyname = 'mentorship_registrations_all_admin') THEN
    CREATE POLICY mentorship_registrations_all_admin ON public.mentorship_registrations FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END$$;

-- Mentorship Teams Policies
DO $$
BEGIN
  -- Allow authenticated users to create teams
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_teams' AND policyname = 'mentorship_teams_insert_authenticated') THEN
    CREATE POLICY mentorship_teams_insert_authenticated ON public.mentorship_teams FOR INSERT TO authenticated WITH CHECK (leader_id = auth.uid()::uuid);
  END IF;

  -- Allow users to view teams (needed for displaying team names in invites etc)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_teams' AND policyname = 'mentorship_teams_select_authenticated') THEN
    CREATE POLICY mentorship_teams_select_authenticated ON public.mentorship_teams FOR SELECT TO authenticated USING (true);
  END IF;

   -- Admin Access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentorship_teams' AND policyname = 'mentorship_teams_all_admin') THEN
    CREATE POLICY mentorship_teams_all_admin ON public.mentorship_teams FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END$$;


-- ================================================================
-- 9. Storage Buckets
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;
