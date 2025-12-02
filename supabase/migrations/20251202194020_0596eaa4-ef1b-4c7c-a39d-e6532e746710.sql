-- Allow users to insert their own organizer role during signup
CREATE POLICY "Users can insert own organizer role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND role = 'organizer');