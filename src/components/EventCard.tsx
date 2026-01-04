import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  venue: string;
  location: string;
  eventDate: string;
  category?: {
    name: string;
    icon: string;
  };
  minPrice?: number;
}

// Default fallback images for events without banners
const FALLBACK_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
];

// Get consistent fallback image based on event ID
const getFallbackImage = (id: string) => {
  const index = id.charCodeAt(0) % FALLBACK_EVENT_IMAGES.length;
  return FALLBACK_EVENT_IMAGES[index];
};

export const EventCard = ({
  id,
  title,
  description,
  bannerUrl,
  venue,
  location,
  eventDate,
  category,
  minPrice,
}: EventCardProps) => {
  const imageUrl = bannerUrl || getFallbackImage(id);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 active:scale-[0.98] card-interactive group">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = getFallbackImage(id);
          }}
        />
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors">{title}</h3>
          {category && (
            <Badge variant="secondary" className="transition-transform duration-200 group-hover:scale-105">
              {category.icon} {category.name}
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(eventDate), 'PPP')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{venue}, {location}</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        {minPrice !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-lg font-bold text-primary transition-transform duration-200 group-hover:scale-105">KES {minPrice.toLocaleString()}</p>
          </div>
        )}
        <Link to={`/events/${id}`} className="ml-auto">
          <Button className="hover-lift">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
