-- Create mentorship_teams table
CREATE TABLE IF NOT EXISTS public.mentorship_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.mentorship_programs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns to mentorship_registrations
ALTER TABLE public.mentorship_registrations 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.mentorship_teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member', -- 'leader' or 'member'
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'accepted'; -- 'accepted', 'pending', 'rejected'

-- Add RLS policies for mentorship_teams
ALTER TABLE public.mentorship_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" 
ON public.mentorship_teams FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create teams" 
ON public.mentorship_teams FOR INSERT 
WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their teams" 
ON public.mentorship_teams FOR UPDATE 
USING (auth.uid() = leader_id);

-- Update RLS for registrations to allow team members to view
-- (Existing policies might need adjustment, but basic select usually allows own rows. 
-- We might need a policy to allow viewing rows of team members, but for now let's stick to basics)
