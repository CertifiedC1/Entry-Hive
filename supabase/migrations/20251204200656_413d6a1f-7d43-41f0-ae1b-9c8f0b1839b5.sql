-- Create storage bucket for event banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload event banners
CREATE POLICY "Authenticated users can upload event banners"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);

-- Create policy for public access to event banners
CREATE POLICY "Public access to event banners"
ON storage.objects
FOR SELECT
USING (bucket_id = 'events');

-- Create policy for users to update their own uploads
CREATE POLICY "Users can update their own event banners"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'events'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own uploads
CREATE POLICY "Users can delete their own event banners"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'events'
  AND auth.uid()::text = (storage.foldername(name))[1]
);