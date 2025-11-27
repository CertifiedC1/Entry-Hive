-- Insert sample categories only
INSERT INTO categories (name, slug, description, icon) 
VALUES 
  ('Music', 'music', 'Live music concerts and festivals', '🎵'),
  ('Sports', 'sports', 'Sporting events and competitions', '⚽'),
  ('Conference', 'conference', 'Professional conferences and seminars', '💼'),
  ('Theater', 'theater', 'Theater performances and shows', '🎭'),
  ('Comedy', 'comedy', 'Stand-up comedy shows', '😂')
ON CONFLICT (slug) DO NOTHING;