import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const InteractiveText = ({ text, className, as: Component = 'span' }: InteractiveTextProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const letters = text.split('');

  return (
    <Component className={cn("inline-flex flex-wrap", className)}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className={cn(
            "inline-block transition-all duration-200 cursor-default",
            letter === ' ' && 'w-2',
            hoveredIndex === index && "text-primary scale-125 -translate-y-1"
          )}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            transform: hoveredIndex !== null && Math.abs(hoveredIndex - index) <= 2
              ? `translateY(${-4 * (1 - Math.abs(hoveredIndex - index) / 3)}px) scale(${1 + 0.1 * (1 - Math.abs(hoveredIndex - index) / 3)})`
              : undefined,
            color: hoveredIndex !== null && Math.abs(hoveredIndex - index) <= 2
              ? `hsl(var(--primary) / ${1 - Math.abs(hoveredIndex - index) / 4})`
              : undefined
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </Component>
  );
};

// Animated counter for stats
interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = ({ end, suffix = '', duration = 2000, className }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useState(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(end * easeOut));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  });

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};