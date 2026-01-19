-- Fix test ticket minimum price (KES 10 minimum)
update public.ticket_types
set price = 10
where id = 'f66f7e71-c3fb-4255-9fc3-a4640e67b378';

-- Update test event title to match new minimum
update public.events
set title = 'Test Payment Event - 10 KES'
where id = '2c439103-1d6b-4451-8e8f-81dc33e877bc';

-- Curate a few sample event banners with Unsplash images (people-focused)
update public.events set banner_url = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80'
where id = 'c90be4a1-5081-4bc3-a8a7-b3eaabc53089';

update public.events set banner_url = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80'
where id = '09c57966-16ef-4a2e-a784-602315d5a65e';

update public.events set banner_url = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80'
where id = '835a5aa4-37ae-4bae-8d74-1a87dcf9a030';

update public.events set banner_url = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80'
where id = '15d1824b-ef23-4761-94e4-0359e8eec054';

update public.events set banner_url = 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1200&q=80'
where id = 'b3cf8a25-b265-4992-baf6-7e93385452db';

update public.events set banner_url = 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&q=80'
where id = '24e70ed9-50f7-4234-acb4-15e71ebbffae';
