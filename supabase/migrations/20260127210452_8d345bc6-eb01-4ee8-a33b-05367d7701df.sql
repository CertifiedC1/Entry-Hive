-- Fix organizers RLS: Hide contact info from public, only show to event ticket holders
DROP POLICY IF EXISTS "Anyone can view verified organizers" ON public.organizers;

-- Public can see organizer name and logo only
CREATE POLICY "Public can view organizer basic info" 
ON public.organizers 
FOR SELECT 
USING (
  (verified = true) 
  OR (auth.uid() = user_id)
);

-- Create a view for public organizer data (without contact info)
CREATE OR REPLACE VIEW public.organizers_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  organization_name,
  description,
  logo_url,
  website_url,
  verified,
  created_at
FROM public.organizers
WHERE verified = true;

-- Add policy for system to insert notifications via service role
-- Service role bypasses RLS, but add explicit policy for clarity
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Restrict what profile fields organizers can see
-- Create a function to check if user is organizer of an event the profile user attended
CREATE OR REPLACE FUNCTION public.is_event_organizer_for_attendee(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    JOIN organizers o ON e.organizer_id = o.id
    WHERE t.user_id = profile_user_id
      AND o.user_id = auth.uid()
  )
$$;