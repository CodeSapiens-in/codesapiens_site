-- Run this in Supabase SQL Editor to fix team registration username lookup
-- This creates a function that can look up users by username, bypassing RLS

-- Function to get user by username (for team registration)
CREATE OR REPLACE FUNCTION public.get_user_by_username(lookup_username TEXT)
RETURNS TABLE (uid TEXT, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT u.uid, u.username
    FROM public.users u
    WHERE u.username = lookup_username;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_by_username(TEXT) TO authenticated;

-- Alternative: If you want to allow reading all usernames via SELECT (simpler but less secure)
-- Uncomment the lines below if you prefer this approach instead of the RPC function:
--
-- CREATE POLICY "Allow reading usernames for team registration" 
-- ON public.users 
-- FOR SELECT 
-- USING (true);
