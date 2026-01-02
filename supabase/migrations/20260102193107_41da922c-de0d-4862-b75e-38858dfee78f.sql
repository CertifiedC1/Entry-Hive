-- Insert 20 sample events with dates from Jan 3, 2026 to Jan 10, 2026
INSERT INTO events (title, slug, description, event_date, end_date, location, venue, organizer_id, category_id, published, featured, banner_url) VALUES
-- Music Events
('Nairobi Jazz Festival 2026', 'nairobi-jazz-festival-2026', 'Experience the best of African jazz with international artists at this spectacular outdoor festival. Featuring live performances, food stalls, and art exhibitions.', '2026-01-03 18:00:00+03', '2026-01-03 23:00:00+03', 'Nairobi, Kenya', 'Uhuru Gardens', '14add378-0cd5-4a66-8406-117608cb1e4a', '5375721e-06e7-4e85-99d4-97b1c1ae9d3c', true, true, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'),

('Afrobeats Night Live', 'afrobeats-night-live', 'Dance the night away with the hottest Afrobeats DJs and live performances. An unforgettable night of African rhythm and beats.', '2026-01-05 20:00:00+03', '2026-01-06 02:00:00+03', 'Nairobi, Kenya', 'Carnivore Grounds', '14add378-0cd5-4a66-8406-117608cb1e4a', '5375721e-06e7-4e85-99d4-97b1c1ae9d3c', true, false, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'),

-- Technology Events
('Tech Summit Kenya 2026', 'tech-summit-kenya-2026', 'Join innovators, startups, and tech leaders for a day of insights, networking, and groundbreaking technology showcases.', '2026-01-04 09:00:00+03', '2026-01-04 17:00:00+03', 'Nairobi, Kenya', 'KICC', '14add378-0cd5-4a66-8406-117608cb1e4a', '52fd8cbb-84c1-4a55-b2ee-9c053198373f', true, true, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'),

('AI & Machine Learning Workshop', 'ai-ml-workshop-2026', 'Hands-on workshop covering the latest in artificial intelligence and machine learning. Perfect for developers and data scientists.', '2026-01-07 10:00:00+03', '2026-01-07 16:00:00+03', 'Nairobi, Kenya', 'iHub Kenya', '14add378-0cd5-4a66-8406-117608cb1e4a', '52fd8cbb-84c1-4a55-b2ee-9c053198373f', true, false, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'),

-- Sports Events
('Nairobi Marathon 2026', 'nairobi-marathon-2026', 'Run through the scenic streets of Nairobi in this annual marathon event. Categories for all fitness levels.', '2026-01-05 06:00:00+03', '2026-01-05 12:00:00+03', 'Nairobi, Kenya', 'Nyayo National Stadium', '14add378-0cd5-4a66-8406-117608cb1e4a', '4352ed57-ac3a-41c3-9f14-3dd1b6c2c822', true, true, 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800'),

('Kenya Premier League: Gor Mahia vs AFC Leopards', 'gor-vs-leopards-2026', 'The biggest football derby in Kenya! Watch the Mashemeji Derby live with thousands of passionate fans.', '2026-01-08 15:00:00+03', '2026-01-08 17:00:00+03', 'Nairobi, Kenya', 'Kasarani Stadium', '14add378-0cd5-4a66-8406-117608cb1e4a', '4352ed57-ac3a-41c3-9f14-3dd1b6c2c822', true, false, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'),

-- Comedy Events
('Laugh Out Loud Comedy Night', 'laugh-out-loud-2026', 'Get ready for non-stop laughter with Kenyas top comedians. An evening of hilarious stand-up comedy acts.', '2026-01-03 19:30:00+03', '2026-01-03 22:00:00+03', 'Nairobi, Kenya', 'Alliance Française', '14add378-0cd5-4a66-8406-117608cb1e4a', 'f81bfad8-0d8f-4049-a0ad-b6121b122bd0', true, false, 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800'),

('Churchill Show Live', 'churchill-show-live-2026', 'The legendary Churchill Show comes to you live! Experience the magic of Kenyas biggest comedy brand.', '2026-01-09 18:00:00+03', '2026-01-09 21:00:00+03', 'Nairobi, Kenya', 'Carnivore Grounds', '14add378-0cd5-4a66-8406-117608cb1e4a', 'f81bfad8-0d8f-4049-a0ad-b6121b122bd0', true, true, 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'),

-- Arts & Culture Events
('Nairobi Art Week 2026', 'nairobi-art-week-2026', 'Celebrate African art and creativity with exhibitions, workshops, and live art demonstrations from renowned artists.', '2026-01-06 10:00:00+03', '2026-01-06 18:00:00+03', 'Nairobi, Kenya', 'Nairobi National Museum', '14add378-0cd5-4a66-8406-117608cb1e4a', 'd9c1f40d-6dd1-442b-b7ca-c790c6541c9d', true, false, 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800'),

('African Heritage Festival', 'african-heritage-festival-2026', 'A colorful celebration of African culture featuring traditional music, dance, fashion, and cuisine from across the continent.', '2026-01-10 09:00:00+03', '2026-01-10 20:00:00+03', 'Nairobi, Kenya', 'Bomas of Kenya', '14add378-0cd5-4a66-8406-117608cb1e4a', 'd9c1f40d-6dd1-442b-b7ca-c790c6541c9d', true, true, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'),

-- Business Events
('Startup Pitch Competition', 'startup-pitch-2026', 'Watch innovative startups compete for investment funding. Network with investors and entrepreneurs.', '2026-01-04 14:00:00+03', '2026-01-04 18:00:00+03', 'Nairobi, Kenya', 'Radisson Blu Hotel', '14add378-0cd5-4a66-8406-117608cb1e4a', '437cc4bc-8d62-41f7-ba4c-c365800c093c', true, false, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'),

('Business Networking Breakfast', 'business-networking-breakfast-2026', 'Start your day with valuable connections. Meet industry leaders and potential business partners over breakfast.', '2026-01-07 07:00:00+03', '2026-01-07 10:00:00+03', 'Nairobi, Kenya', 'Villa Rosa Kempinski', '14add378-0cd5-4a66-8406-117608cb1e4a', '437cc4bc-8d62-41f7-ba4c-c365800c093c', true, false, 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'),

-- Conference Events
('East Africa Digital Summit', 'east-africa-digital-summit-2026', 'The premier digital transformation conference in East Africa. Learn from global experts and industry pioneers.', '2026-01-08 08:00:00+03', '2026-01-08 17:00:00+03', 'Nairobi, Kenya', 'Kenyatta International Convention Centre', '14add378-0cd5-4a66-8406-117608cb1e4a', 'd1d4555c-0a5e-4be2-b585-5e7c4195ed48', true, true, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800'),

('Healthcare Innovation Conference', 'healthcare-innovation-2026', 'Exploring the future of healthcare in Africa. Medical professionals and innovators share groundbreaking solutions.', '2026-01-09 09:00:00+03', '2026-01-09 16:00:00+03', 'Nairobi, Kenya', 'Sarova Stanley Hotel', '14add378-0cd5-4a66-8406-117608cb1e4a', 'd1d4555c-0a5e-4be2-b585-5e7c4195ed48', true, false, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'),

-- Education Events
('Career Fair 2026', 'career-fair-2026', 'Connect with top employers and explore exciting career opportunities. Perfect for students and job seekers.', '2026-01-06 09:00:00+03', '2026-01-06 16:00:00+03', 'Nairobi, Kenya', 'University of Nairobi', '14add378-0cd5-4a66-8406-117608cb1e4a', '7953efa3-37f5-4436-a9c0-45a81c31c818', true, false, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800'),

('Coding Bootcamp for Beginners', 'coding-bootcamp-2026', 'Start your programming journey! A comprehensive bootcamp covering web development fundamentals.', '2026-01-10 08:00:00+03', '2026-01-10 17:00:00+03', 'Nairobi, Kenya', 'Moringa School', '14add378-0cd5-4a66-8406-117608cb1e4a', '7953efa3-37f5-4436-a9c0-45a81c31c818', true, false, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'),

-- Food & Drink Events
('Nairobi Food Festival', 'nairobi-food-festival-2026', 'Taste the best of Kenyan and international cuisine. Street food, gourmet dishes, and live cooking demonstrations.', '2026-01-04 11:00:00+03', '2026-01-04 21:00:00+03', 'Nairobi, Kenya', 'Karura Forest', '14add378-0cd5-4a66-8406-117608cb1e4a', '169c1893-117c-4628-b8fe-0c0ad99dc0a0', true, true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),

('Wine Tasting Evening', 'wine-tasting-2026', 'Discover exceptional wines from around the world. Expert sommeliers guide you through an unforgettable tasting experience.', '2026-01-07 18:00:00+03', '2026-01-07 21:00:00+03', 'Nairobi, Kenya', 'The Talisman Restaurant', '14add378-0cd5-4a66-8406-117608cb1e4a', '169c1893-117c-4628-b8fe-0c0ad99dc0a0', true, false, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),

-- Theater Events
('The Lion King Musical', 'lion-king-musical-2026', 'Experience the magic of Disneys The Lion King brought to life on stage. A spectacular production for all ages.', '2026-01-05 14:00:00+03', '2026-01-05 17:00:00+03', 'Nairobi, Kenya', 'Kenya National Theatre', '14add378-0cd5-4a66-8406-117608cb1e4a', 'aa7d970f-02cf-461c-9914-a682933aeb09', true, true, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800'),

('Shakespeare in the Park', 'shakespeare-park-2026', 'Classic Shakespeare performed under the stars. Bring a blanket and enjoy an evening of timeless theater.', '2026-01-09 17:00:00+03', '2026-01-09 20:00:00+03', 'Nairobi, Kenya', 'Nairobi Arboretum', '14add378-0cd5-4a66-8406-117608cb1e4a', 'aa7d970f-02cf-461c-9914-a682933aeb09', true, false, 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'),

-- Entertainment Events
('New Year Celebration Party', 'new-year-party-2026', 'Start 2026 with a bang! The biggest New Year party featuring top DJs, live performances, and fireworks.', '2026-01-03 20:00:00+03', '2026-01-04 04:00:00+03', 'Nairobi, Kenya', 'Two Rivers Mall', '14add378-0cd5-4a66-8406-117608cb1e4a', '2d390cdd-d9b4-4457-b59c-95be53a3311f', true, true, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800');

-- Add ticket types for all new events
INSERT INTO ticket_types (event_id, name, description, price, quantity_available, sale_start_date, sale_end_date)
SELECT 
  e.id,
  'Regular',
  'General admission ticket',
  CASE 
    WHEN c.slug = 'music' THEN 2500
    WHEN c.slug = 'technology' THEN 5000
    WHEN c.slug = 'sports' THEN 1500
    WHEN c.slug = 'comedy' THEN 2000
    WHEN c.slug = 'arts-culture' THEN 1000
    WHEN c.slug = 'business' THEN 3500
    WHEN c.slug = 'conference' THEN 7500
    WHEN c.slug = 'education' THEN 500
    WHEN c.slug = 'food-drink' THEN 1500
    WHEN c.slug = 'theater' THEN 3000
    WHEN c.slug = 'entertainment' THEN 2500
    ELSE 2000
  END,
  200,
  NOW(),
  e.event_date
FROM events e
JOIN categories c ON e.category_id = c.id
WHERE e.slug IN (
  'nairobi-jazz-festival-2026', 'afrobeats-night-live', 'tech-summit-kenya-2026', 
  'ai-ml-workshop-2026', 'nairobi-marathon-2026', 'gor-vs-leopards-2026',
  'laugh-out-loud-2026', 'churchill-show-live-2026', 'nairobi-art-week-2026',
  'african-heritage-festival-2026', 'startup-pitch-2026', 'business-networking-breakfast-2026',
  'east-africa-digital-summit-2026', 'healthcare-innovation-2026', 'career-fair-2026',
  'coding-bootcamp-2026', 'nairobi-food-festival-2026', 'wine-tasting-2026',
  'lion-king-musical-2026', 'shakespeare-park-2026', 'new-year-party-2026'
);

-- Add VIP tickets for featured events
INSERT INTO ticket_types (event_id, name, description, price, quantity_available, sale_start_date, sale_end_date)
SELECT 
  e.id,
  'VIP',
  'VIP access with premium seating and exclusive perks',
  CASE 
    WHEN c.slug = 'music' THEN 7500
    WHEN c.slug = 'technology' THEN 15000
    WHEN c.slug = 'sports' THEN 5000
    WHEN c.slug = 'comedy' THEN 5000
    WHEN c.slug = 'arts-culture' THEN 3000
    WHEN c.slug = 'conference' THEN 20000
    WHEN c.slug = 'food-drink' THEN 5000
    WHEN c.slug = 'theater' THEN 8000
    WHEN c.slug = 'entertainment' THEN 7500
    ELSE 5000
  END,
  50,
  NOW(),
  e.event_date
FROM events e
JOIN categories c ON e.category_id = c.id
WHERE e.featured = true
AND e.slug IN (
  'nairobi-jazz-festival-2026', 'tech-summit-kenya-2026', 'nairobi-marathon-2026',
  'churchill-show-live-2026', 'african-heritage-festival-2026', 'east-africa-digital-summit-2026',
  'nairobi-food-festival-2026', 'lion-king-musical-2026', 'new-year-party-2026'
);