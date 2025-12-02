import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Heart, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  venue: string;
  location: string;
  event_date: string;
  end_date: string | null;
  categories: {
    name: string;
  } | null;
  ticket_types: Array<{
    price: number;
    quantity_available: number;
    quantity_sold: number;
  }>;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedLocation]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          categories (name),
          ticket_types (price, quantity_available, quantity_sold)
        `)
        .eq('published', true)
        .order('event_date', { ascending: true });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (selectedLocation !== 'all') {
        query = query.ilike('location', `%${selectedLocation}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error('Failed to load events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinPrice = (ticketTypes: Event['ticket_types']) => {
    if (!ticketTypes || ticketTypes.length === 0) return null;
    const prices = ticketTypes.map(t => Number(t.price)).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const isRegistrationClosed = (ticketTypes: Event['ticket_types']) => {
    if (!ticketTypes || ticketTypes.length === 0) return true;
    return ticketTypes.every(t => t.quantity_sold >= t.quantity_available);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Search Section */}
      <section className="border-b bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search an event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 text-base"
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-medium">Choose a Location :</span>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="nairobi">Nairobi</SelectItem>
                <SelectItem value="mombasa">Mombasa</SelectItem>
                <SelectItem value="kisumu">Kisumu</SelectItem>
                <SelectItem value="nakuru">Nakuru</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No events found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                const minPrice = getMinPrice(event.ticket_types);
                const isClosed = isRegistrationClosed(event.ticket_types);

                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block"
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-4 border-b hover:bg-muted/30 transition-colors">
                      {/* Event Details */}
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-primary text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(event.event_date), "EEE dd MMM yy h:mm a")}
                            {event.end_date && (
                              <> To {format(new Date(event.end_date), "EEE dd MMM yy h:mm a")}</>
                            )}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {minPrice === 0 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              FREE
                            </Badge>
                          ) : minPrice ? (
                            <p className="text-sm text-muted-foreground">
                              Starts at <span className="font-semibold text-foreground">{minPrice.toLocaleString()} Ksh</span>
                            </p>
                          ) : null}

                          <p className="text-sm text-muted-foreground">
                            {event.venue}
                          </p>

                          {isClosed ? (
                            <Badge variant="destructive" className="text-xs">
                              Registrations Closed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Event Image */}
                      <div className="relative w-full md:w-72 h-48 md:h-40 flex-shrink-0">
                        <img
                          src={event.banner_url || `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80`}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Heart className="h-5 w-5 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Events;
