import { useState, useEffect } from 'react';

const slideshowImages = [
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80',
    title: 'Discover Amazing Events',
    subtitle: 'Book tickets to the best concerts, festivals, and shows'
  },
  {
    url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80',
    title: 'Live Music Experiences',
    subtitle: 'Feel the energy of live performances'
  },
  {
    url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1920&q=80',
    title: 'Festival Season',
    subtitle: 'Join thousands at the biggest festivals'
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80',
    title: 'Unforgettable Nights',
    subtitle: 'Create memories that last forever'
  }
];

export const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {slideshowImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image.url}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
              <h1 
                className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 transition-all duration-700 ${
                  index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                {image.title}
              </h1>
              <p 
                className={`text-xl md:text-2xl text-white/90 transition-all duration-700 delay-200 ${
                  index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                {image.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slideshowImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-primary w-8' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
