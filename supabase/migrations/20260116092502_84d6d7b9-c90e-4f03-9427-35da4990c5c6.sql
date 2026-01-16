-- Fix profiles table public read vulnerability
-- Drop the overly permissive policy that allows anyone to read all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more restrictive policy that:
-- 1. Allows users to view their own profile
-- 2. Allows organizers to view profiles of users who purchased tickets to their events
CREATE POLICY "Users can view own profile or attendees of their events"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM tickets t
      JOIN events e ON t.event_id = e.id
      JOIN organizers o ON e.organizer_id = o.id
      WHERE t.user_id = profiles.id
      AND o.user_id = auth.uid()
    )
  );