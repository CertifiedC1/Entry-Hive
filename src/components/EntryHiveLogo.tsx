import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EntryHiveLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const EntryHiveLogo = ({ className, showText = true, size = 'md' }: EntryHiveLogoProps) => {
  const [beePosition, setBeePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  useEffect(() => {
    if (!isHovering) return;

    const interval = setInterval(() => {
      setBeePosition({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div 
      ref={containerRef}
      className={cn("flex items-center gap-2", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setBeePosition({ x: 0, y: 0 });
      }}
    >
      {/* Animated Bee Logo */}
      <div 
        className={cn(
          "relative transition-transform duration-150 ease-out",
          sizeClasses[size]
        )}
        style={{
          transform: `translate(${beePosition.x}px, ${beePosition.y}px)`
        }}
      >
        <svg 
          viewBox="0 0 64 64" 
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagon honeycomb background */}
          <path 
            d="M32 4L52 16V40L32 52L12 40V16L32 4Z" 
            className="fill-primary/20 stroke-primary"
            strokeWidth="2"
          />
          
          {/* Inner hexagon */}
          <path 
            d="M32 12L44 20V36L32 44L20 36V20L32 12Z" 
            className="fill-primary/30"
          />
          
          {/* Bee body - main oval */}
          <ellipse 
            cx="32" 
            cy="30" 
            rx="10" 
            ry="12" 
            className="fill-amber-400"
          />
          
          {/* Bee stripes */}
          <path 
            d="M22 27H42" 
            className="stroke-amber-900"
            strokeWidth="3"
          />
          <path 
            d="M23 33H41" 
            className="stroke-amber-900"
            strokeWidth="3"
          />
          
          {/* Bee head */}
          <circle 
            cx="32" 
            cy="19" 
            r="5" 
            className="fill-amber-900"
          />
          
          {/* Bee eyes */}
          <circle cx="30" cy="18" r="1.5" className="fill-white" />
          <circle cx="34" cy="18" r="1.5" className="fill-white" />
          
          {/* Bee antennae */}
          <path 
            d="M29 14C29 14 27 10 25 9" 
            className="stroke-amber-900"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path 
            d="M35 14C35 14 37 10 39 9" 
            className="stroke-amber-900"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Bee wings */}
          <ellipse 
            cx="24" 
            cy="26" 
            rx="6" 
            ry="4" 
            className={cn(
              "fill-white/80 stroke-primary/50 transition-all duration-100",
              isHovering && "animate-pulse"
            )}
            strokeWidth="0.5"
            style={{
              transform: isHovering ? 'rotate(-10deg)' : 'rotate(0deg)',
              transformOrigin: '24px 26px'
            }}
          />
          <ellipse 
            cx="40" 
            cy="26" 
            rx="6" 
            ry="4" 
            className={cn(
              "fill-white/80 stroke-primary/50 transition-all duration-100",
              isHovering && "animate-pulse"
            )}
            strokeWidth="0.5"
            style={{
              transform: isHovering ? 'rotate(10deg)' : 'rotate(0deg)',
              transformOrigin: '40px 26px'
            }}
          />
          
          {/* Bee stinger */}
          <path 
            d="M32 42L32 46" 
            className="stroke-amber-900"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Flying animation particles when hovering */}
        {isHovering && (
          <>
            <span className="absolute -top-1 -left-1 w-1 h-1 bg-amber-300 rounded-full animate-ping" />
            <span className="absolute -top-2 right-0 w-1 h-1 bg-amber-300 rounded-full animate-ping animation-delay-100" />
          </>
        )}
      </div>

      {showText && (
        <span className={cn(
          "font-bold text-primary tracking-tight",
          textSizes[size]
        )}>
          EntryHive
        </span>
      )}
    </div>
  );
};
