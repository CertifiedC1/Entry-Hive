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
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Ticket className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-xl font-bold">{title}</h3>
          {category && (
            <Badge variant="secondary">
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
            <p className="text-lg font-bold text-primary">KES {minPrice.toLocaleString()}</p>
          </div>
        )}
        <Link to={`/events/${id}`} className="ml-auto">
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
