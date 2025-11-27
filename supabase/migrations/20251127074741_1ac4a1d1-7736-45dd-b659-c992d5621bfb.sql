-- Add unique constraint to organizers user_id
ALTER TABLE organizers ADD CONSTRAINT organizers_user_id_unique UNIQUE (user_id);

-- Create function to increment ticket sold count
CREATE OR REPLACE FUNCTION increment_ticket_sold(ticket_type_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ticket_types
  SET quantity_sold = quantity_sold + quantity
  WHERE id = ticket_type_id;
END;
$$;