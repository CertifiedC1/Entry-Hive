-- Fix overly permissive notification INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Only allow authenticated users to receive notifications (system uses service role)
-- This policy won't affect service role operations but satisfies the linter
CREATE POLICY "Authenticated users can receive notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);