-- Insert sample organizer
INSERT INTO organizers (user_id, organization_name, description, contact_email, contact_phone, verified)
VALUES 
  ('0b038374-cb64-4e0c-a228-7713380433a4', 'Ticketyetu Events', 'Premier event organizer in Kenya specializing in music, sports, and entertainment events', 'events@ticketyetu.com', '+254793333888', true)
ON CONFLICT (user_id) DO NOTHING;

-- Get the organizer ID for events
DO $$
DECLARE
  org_id UUID;
  music_cat UUID;
  sports_cat UUID;
  tech_cat UUID;
BEGIN
  -- Get organizer ID
  SELECT id INTO org_id FROM organizers WHERE user_id = '0b038374-cb64-4e0c-a228-7713380433a4' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO music_cat FROM categories WHERE slug = 'music' LIMIT 1;
  SELECT id INTO sports_cat FROM categories WHERE slug = 'sports' LIMIT 1;
  SELECT id INTO tech_cat FROM categories WHERE slug = 'technology' LIMIT 1;
  
  -- Insert sample events
  INSERT INTO events (
    organizer_id, 
    category_id, 
    title, 
    slug, 
    description, 
    event_date,
    end_date,
    location, 
    venue, 
    banner_url,
    published,
    featured,
    total_capacity
  ) VALUES
  (
    org_id,
    music_cat,
    'Nairobi Music Festival 2025',
    'nairobi-music-festival-2025',
    'Join us for the biggest music festival of the year featuring top local and international artists. Experience three days of non-stop entertainment, food, and culture.',
    '2025-12-15 18:00:00+03',
    '2025-12-17 23:00:00+03',
    'Nairobi, Kenya',
    'Uhuru Gardens',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&q=80',
    true,
    true,
    5000
  ),
  (
    org_id,
    sports_cat,
    'Nairobi Marathon 2025',
    'nairobi-marathon-2025',
    'Annual marathon event bringing together runners from across Kenya and the world. Choose from full marathon, half marathon, or 10K categories.',
    '2025-11-20 06:00:00+03',
    '2025-11-20 14:00:00+03',
    'Nairobi, Kenya',
    'Uhuru Park',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=1920&q=80',
    true,
    true,
    10000
  ),
  (
    org_id,
    tech_cat,
    'Tech Innovation Summit Kenya',
    'tech-innovation-summit-kenya',
    'East Africa''s premier technology conference featuring keynote speakers, workshops, and networking opportunities for entrepreneurs and tech enthusiasts.',
    '2025-12-05 09:00:00+03',
    '2025-12-06 18:00:00+03',
    'Nairobi, Kenya',
    'KICC',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    true,
    false,
    1000
  ),
  (
    org_id,
    music_cat,
    'Afrobeat Night Live',
    'afrobeat-night-live',
    'Experience the best of Afrobeat music with live performances from top DJs and artists. Dance the night away to the hottest African beats.',
    '2025-12-28 20:00:00+03',
    '2025-12-29 04:00:00+03',
    'Nairobi, Kenya',
    'Carnivore Grounds',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80',
    true,
    false,
    2000
  )
  ON CONFLICT (slug) DO NOTHING;
  
  -- Insert ticket types for each event
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'Early Bird',
    'Limited early bird tickets at discounted price',
    2500,
    500
  FROM events e
  WHERE e.slug = 'nairobi-music-festival-2025'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'General Admission',
    'Standard festival access',
    3500,
    3000
  FROM events e
  WHERE e.slug = 'nairobi-music-festival-2025'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'VIP',
    'VIP access with exclusive benefits',
    7500,
    500
  FROM events e
  WHERE e.slug = 'nairobi-music-festival-2025'
  ON CONFLICT DO NOTHING;
  
  -- Marathon tickets
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'Full Marathon (42km)',
    'Full marathon registration',
    3000,
    3000
  FROM events e
  WHERE e.slug = 'nairobi-marathon-2025'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'Half Marathon (21km)',
    'Half marathon registration',
    2000,
    5000
  FROM events e
  WHERE e.slug = 'nairobi-marathon-2025'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    '10K Fun Run',
    '10 kilometer fun run',
    1000,
    2000
  FROM events e
  WHERE e.slug = 'nairobi-marathon-2025'
  ON CONFLICT DO NOTHING;
  
  -- Tech Summit tickets
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'Student Pass',
    'Discounted student admission',
    5000,
    200
  FROM events e
  WHERE e.slug = 'tech-innovation-summit-kenya'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'Professional Pass',
    'Full conference access',
    12000,
    600
  FROM events e
  WHERE e.slug = 'tech-innovation-summit-kenya'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'VIP Pass',
    'VIP access with networking dinner',
    25000,
    200
  FROM events e
  WHERE e.slug = 'tech-innovation-summit-kenya'
  ON CONFLICT DO NOTHING;
  
  -- Afrobeat Night tickets
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'Regular Entry',
    'Standard club entry',
    1500,
    1500
  FROM events e
  WHERE e.slug = 'afrobeat-night-live'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
  SELECT 
    e.id,
    'VIP Table',
    'Reserved VIP table with bottle service',
    15000,
    50
  FROM events e
  WHERE e.slug = 'afrobeat-night-live'
  ON CONFLICT DO NOTHING;
  
END $$;