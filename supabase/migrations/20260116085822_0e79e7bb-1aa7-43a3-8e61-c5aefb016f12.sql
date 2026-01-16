-- Insert 15 sample events from today (Jan 16) to Jan 31, 2026
-- One event costs 1 KES for testing, others cost 1000+ KES

DO $$
DECLARE
  organizer_uuid UUID := '14add378-0cd5-4a66-8406-117608cb1e4a';
  event1_id UUID := gen_random_uuid();
  event2_id UUID := gen_random_uuid();
  event3_id UUID := gen_random_uuid();
  event4_id UUID := gen_random_uuid();
  event5_id UUID := gen_random_uuid();
  event6_id UUID := gen_random_uuid();
  event7_id UUID := gen_random_uuid();
  event8_id UUID := gen_random_uuid();
  event9_id UUID := gen_random_uuid();
  event10_id UUID := gen_random_uuid();
  event11_id UUID := gen_random_uuid();
  event12_id UUID := gen_random_uuid();
  event13_id UUID := gen_random_uuid();
  event14_id UUID := gen_random_uuid();
  event15_id UUID := gen_random_uuid();
BEGIN
  -- Event 1: TEST EVENT - 1 KES (for payment testing)
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event1_id, 'Test Payment Event - 1 KES', 'test-payment-event', 'This is a test event for payment testing. Purchase a ticket for just 1 KES to test the full checkout flow!', 'Online Event', 'Nairobi, Kenya', '2026-01-17 10:00:00+03', '2026-01-17 12:00:00+03', '52fd8cbb-84c1-4a55-b2ee-9c053198373f', organizer_uuid, true, true, 1000, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES (event1_id, 'Test Ticket', 1, 500, 0, 'Test ticket for 1 KES - perfect for testing the payment flow');

  -- Event 2: Nairobi Tech Summit
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event2_id, 'Nairobi Tech Summit 2026', 'nairobi-tech-summit-2026', 'Join the biggest technology conference in East Africa. Network with industry leaders, attend workshops, and discover the latest innovations.', 'KICC', 'Nairobi, Kenya', '2026-01-18 09:00:00+03', '2026-01-18 18:00:00+03', '52fd8cbb-84c1-4a55-b2ee-9c053198373f', organizer_uuid, true, true, 2000, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event2_id, 'Early Bird', 2500, 500, 0, 'Early bird access to all sessions'),
    (event2_id, 'Regular', 3500, 1000, 0, 'Regular access to all sessions'),
    (event2_id, 'VIP', 7500, 200, 0, 'VIP access with networking dinner');

  -- Event 3: Afrobeats Festival
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event3_id, 'Afrobeats Festival Nairobi', 'afrobeats-festival-nairobi', 'Experience the best of Afrobeats music with top artists from across Africa. Dance, celebrate, and enjoy world-class performances.', 'Uhuru Gardens', 'Nairobi, Kenya', '2026-01-19 14:00:00+03', '2026-01-19 23:00:00+03', '5375721e-06e7-4e85-99d4-97b1c1ae9d3c', organizer_uuid, true, true, 5000, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event3_id, 'General Admission', 1500, 3000, 0, 'General entry to the festival'),
    (event3_id, 'VIP', 5000, 500, 0, 'VIP section with premium viewing');

  -- Event 4: Stand-Up Comedy Night
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event4_id, 'Stand-Up Comedy Night', 'standup-comedy-night', 'Laugh out loud with Kenyas funniest comedians. An evening of non-stop entertainment and hilarious performances.', 'Kenya National Theatre', 'Nairobi, Kenya', '2026-01-20 19:00:00+03', '2026-01-20 22:00:00+03', 'f81bfad8-0d8f-4049-a0ad-b6121b122bd0', organizer_uuid, true, false, 800, 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event4_id, 'Standard', 1200, 600, 0, 'Standard seating'),
    (event4_id, 'Premium', 2500, 200, 0, 'Front row premium seating');

  -- Event 5: Safari Marathon
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event5_id, 'Safari Marathon 2026', 'safari-marathon-2026', 'Run through the stunning Kenyan wilderness in this unique marathon experience. Routes include 5K, 10K, 21K, and full marathon.', 'Maasai Mara', 'Narok, Kenya', '2026-01-21 06:00:00+03', '2026-01-21 14:00:00+03', '4352ed57-ac3a-41c3-9f14-3dd1b6c2c822', organizer_uuid, true, true, 3000, 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event5_id, '5K Run', 1000, 1000, 0, '5K fun run'),
    (event5_id, '10K Run', 1500, 800, 0, '10K race'),
    (event5_id, 'Half Marathon', 2500, 600, 0, '21K half marathon'),
    (event5_id, 'Full Marathon', 4000, 400, 0, '42K full marathon');

  -- Event 6: Art Exhibition
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event6_id, 'Contemporary African Art Exhibition', 'african-art-exhibition', 'Explore stunning works from emerging and established African artists. A celebration of creativity, culture, and artistic expression.', 'Nairobi National Museum', 'Nairobi, Kenya', '2026-01-22 10:00:00+03', '2026-01-22 18:00:00+03', 'd9c1f40d-6dd1-442b-b7ca-c790c6541c9d', organizer_uuid, true, false, 500, 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event6_id, 'General Entry', 800, 400, 0, 'General museum entry'),
    (event6_id, 'Guided Tour', 1500, 100, 0, 'Includes expert guided tour');

  -- Event 7: Business Leadership Conference
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event7_id, 'Business Leadership Conference', 'business-leadership-conference', 'Learn from top business leaders and entrepreneurs. Gain insights on leadership, strategy, and building successful ventures in Africa.', 'Radisson Blu', 'Nairobi, Kenya', '2026-01-23 08:00:00+03', '2026-01-23 17:00:00+03', '437cc4bc-8d62-41f7-ba4c-c365800c093c', organizer_uuid, true, true, 600, 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event7_id, 'Standard Pass', 5000, 400, 0, 'Access to all conference sessions'),
    (event7_id, 'Executive Pass', 12000, 150, 0, 'Includes networking lunch and workshop');

  -- Event 8: Food & Wine Festival
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event8_id, 'Nairobi Food & Wine Festival', 'nairobi-food-wine-festival', 'Indulge in culinary delights from top chefs and sample wines from around the world. A gastronomic adventure awaits!', 'Karura Forest', 'Nairobi, Kenya', '2026-01-24 11:00:00+03', '2026-01-24 20:00:00+03', '169c1893-117c-4628-b8fe-0c0ad99dc0a0', organizer_uuid, true, false, 2000, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event8_id, 'Tasting Pass', 2000, 1500, 0, 'Access with 5 tasting tickets'),
    (event8_id, 'Gourmet Pass', 4500, 400, 0, 'Unlimited tastings and chef meet & greet');

  -- Event 9: Theater Performance
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event9_id, 'The Storyteller - Live Theater', 'the-storyteller-theater', 'A captivating theatrical performance celebrating African folklore and storytelling traditions. Perfect for all ages.', 'Kenya Cultural Centre', 'Nairobi, Kenya', '2026-01-25 15:00:00+03', '2026-01-25 17:30:00+03', 'aa7d970f-02cf-461c-9914-a682933aeb09', organizer_uuid, true, false, 400, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event9_id, 'Standard Seat', 1500, 300, 0, 'Regular theater seating'),
    (event9_id, 'Premium Seat', 3000, 100, 0, 'Best seats in the house');

  -- Event 10: Education Workshop
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event10_id, 'Digital Skills Workshop', 'digital-skills-workshop', 'Master essential digital skills including web development, data analysis, and digital marketing. Hands-on training for career growth.', 'Strathmore University', 'Nairobi, Kenya', '2026-01-26 09:00:00+03', '2026-01-26 16:00:00+03', '7953efa3-37f5-4436-a9c0-45a81c31c818', organizer_uuid, true, false, 150, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event10_id, 'Workshop Pass', 3500, 100, 0, 'Full day workshop access'),
    (event10_id, 'Workshop + Certificate', 5000, 50, 0, 'Includes certification');

  -- Event 11: Jazz Night
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event11_id, 'Jazz Under the Stars', 'jazz-under-stars', 'An enchanting evening of smooth jazz performances in a magical outdoor setting. Featuring top jazz musicians from Kenya and beyond.', 'Waterfront Karen', 'Nairobi, Kenya', '2026-01-27 18:00:00+03', '2026-01-27 23:00:00+03', '5375721e-06e7-4e85-99d4-97b1c1ae9d3c', organizer_uuid, true, true, 800, 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event11_id, 'General', 2000, 600, 0, 'Open seating area'),
    (event11_id, 'Table for 2', 6000, 50, 0, 'Reserved table for two with drinks'),
    (event11_id, 'Table for 4', 10000, 30, 0, 'Reserved table for four with drinks');

  -- Event 12: Entertainment Gala
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event12_id, 'Entertainment Awards Gala', 'entertainment-awards-gala', 'Celebrate excellence in Kenyan entertainment at this glamorous awards ceremony. Red carpet, performances, and star-studded evening.', 'Safari Park Hotel', 'Nairobi, Kenya', '2026-01-28 17:00:00+03', '2026-01-28 23:00:00+03', '2d390cdd-d9b4-4457-b59c-95be53a3311f', organizer_uuid, true, true, 1500, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event12_id, 'Standard', 5000, 1000, 0, 'General admission'),
    (event12_id, 'Gold', 10000, 300, 0, 'Premium seating with dinner'),
    (event12_id, 'Platinum', 25000, 100, 0, 'VIP experience with backstage access');

  -- Event 13: Startup Conference
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event13_id, 'East Africa Startup Conference', 'ea-startup-conference', 'Connect with investors, mentors, and fellow entrepreneurs. Pitch competitions, networking, and insights from successful founders.', 'iHub', 'Nairobi, Kenya', '2026-01-29 08:30:00+03', '2026-01-29 18:00:00+03', 'd1d4555c-0a5e-4be2-b585-5e7c4195ed48', organizer_uuid, true, true, 500, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event13_id, 'Attendee', 2000, 350, 0, 'Conference access'),
    (event13_id, 'Startup Pass', 3500, 100, 0, 'Includes pitch competition entry'),
    (event13_id, 'Investor Pass', 8000, 50, 0, 'Premium networking access');

  -- Event 14: Football Tournament
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event14_id, 'Nairobi Corporate Football Cup', 'corporate-football-cup', 'Watch exciting football action as corporate teams compete for glory. Family-friendly event with food and entertainment.', 'Nyayo Stadium', 'Nairobi, Kenya', '2026-01-30 10:00:00+03', '2026-01-30 18:00:00+03', '4352ed57-ac3a-41c3-9f14-3dd1b6c2c822', organizer_uuid, true, false, 5000, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event14_id, 'General Admission', 500, 4000, 0, 'Stadium entry'),
    (event14_id, 'VIP Stand', 2000, 500, 0, 'Covered VIP section');

  -- Event 15: Concert
  INSERT INTO public.events (id, title, slug, description, venue, location, event_date, end_date, category_id, organizer_id, published, featured, total_capacity, banner_url)
  VALUES (event15_id, 'January Vibes Concert', 'january-vibes-concert', 'End January with a bang! Live performances from top Kenyan and international artists. Music, dancing, and good vibes all night.', 'Carnivore Grounds', 'Nairobi, Kenya', '2026-01-31 16:00:00+03', '2026-02-01 02:00:00+03', '5375721e-06e7-4e85-99d4-97b1c1ae9d3c', organizer_uuid, true, true, 8000, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800');
  
  INSERT INTO public.ticket_types (event_id, name, price, quantity_available, quantity_sold, description)
  VALUES 
    (event15_id, 'Early Bird', 1500, 2000, 0, 'Early bird special'),
    (event15_id, 'Regular', 2500, 4000, 0, 'Regular admission'),
    (event15_id, 'VIP', 7500, 1000, 0, 'VIP section with premium bar'),
    (event15_id, 'VVIP', 15000, 200, 0, 'Exclusive VVIP lounge access');
END $$;