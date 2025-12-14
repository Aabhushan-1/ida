-- ==============================================================================
-- FIX MISSING PROFILES & SETUP AUTO-TRIGGER
-- ==============================================================================
-- This script does two things:
-- 1. Sets up an automatic trigger so new Signups always get a profile.
-- 2. Backfills (Creates) profiles for any existing users (like you) who are missing one.
-- ==============================================================================

-- 1. Create the Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_info (user_id, username, full_name, avatar_url, profile_picture)
  VALUES (
    new.id,
    -- Generate a safe unique handle: @name_1234
    '@' || split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'avatar_url' -- Sync profile_picture too
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. BACKFILL for existing users (Fixes your "Profile not found" error)
INSERT INTO public.user_info (user_id, username, full_name, avatar_url, profile_picture)
SELECT 
    id, 
    '@' || split_part(email, '@', 1) || '_' || substr(md5(random()::text), 1, 4),
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    raw_user_meta_data->>'avatar_url',
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_info)
ON CONFLICT (user_id) DO NOTHING;
