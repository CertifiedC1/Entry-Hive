import { useEffect, useRef } from 'react';

const ticketingImages = [
  {
    url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop',
    title: 'Live Concerts',
    subtitle: 'Experience the magic'
  },
  {
    url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=600&fit=crop',
    title: 'Festival Vibes',
    subtitle: 'Feel the rhythm'
  },
  {
    url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=600&fit=crop',
    title: 'Night Events',
    subtitle: 'Dance till dawn'
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    title: 'Stadium Shows',
    subtitle: 'Unforgettable moments'
  },
  {
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    title: 'Music Events',
    subtitle: 'Feel the beat'
  }
];

export const ImageSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when we've scrolled through half (since we duplicate)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Double the images for seamless loop
  const allImages = [...ticketingImages, ...ticketingImages];

  return (
    <div className="w-full overflow-hidden bg-muted/30 py-8">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {allImages.map((image, index) => (
          <div
            key={index}
            className="flex-shrink-0 relative rounded-xl overflow-hidden group"
            style={{ width: '280px', height: '380px' }}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-xl font-bold">{image.title}</h3>
              <p className="text-sm text-white/80">{image.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
