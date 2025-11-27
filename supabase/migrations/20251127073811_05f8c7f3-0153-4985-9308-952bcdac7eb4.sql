-- Insert sample categories
INSERT INTO categories (name, slug, icon, description) VALUES
('Music', 'music', '🎵', 'Live concerts and music festivals'),
('Sports', 'sports', '⚽', 'Sporting events and competitions'),
('Arts & Culture', 'arts-culture', '🎭', 'Theater, exhibitions, and cultural events'),
('Food & Drink', 'food-drink', '🍕', 'Food festivals and culinary experiences'),
('Entertainment', 'entertainment', '🎪', 'Comedy shows, circus, and entertainment'),
('Technology', 'technology', '💻', 'Tech conferences and meetups'),
('Business', 'business', '💼', 'Business conferences and networking'),
('Education', 'education', '📚', 'Workshops and educational seminars')
ON CONFLICT (slug) DO NOTHING;