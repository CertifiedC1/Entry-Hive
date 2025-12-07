-- Allow organizers to view and update tickets for their events
CREATE POLICY "Organizers can view tickets for their events" 
ON public.tickets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN organizers o ON e.organizer_id = o.id
    WHERE e.id = tickets.event_id AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update tickets for their events" 
ON public.tickets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN organizers o ON e.organizer_id = o.id
    WHERE e.id = tickets.event_id AND o.user_id = auth.uid()
  )
);