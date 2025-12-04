import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Ticket, Loader2, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
  quantity_sold: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  venue: string;
  location: string;
  event_date: string;
  end_date: string | null;
  total_capacity: number | null;
  categories: {
    name: string;
    icon: string;
  } | null;
  organizers: {
    organization_name: string;
    logo_url: string | null;
  };
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchTicketTypes();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          categories (name, icon),
          organizers (organization_name, logo_url)
        `)
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast.error('Failed to load event details');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id)
        .order('price');

      if (error) throw error;
      setTicketTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching ticket types:', error);
    }
  };

  const updateTicketQuantity = (ticketTypeId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, quantity),
    }));
  };

  const getTotalAmount = () => {
    return ticketTypes.reduce((total, ticketType) => {
      const quantity = selectedTickets[ticketType.id] || 0;
      return total + ticketType.price * quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handlePurchase = () => {
    if (!user) {
      toast.error('Please sign in to purchase tickets');
      navigate('/auth');
      return;
    }

    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    // Navigate to attendee details page
    navigate('/attendee-details', {
      state: {
        eventId: id,
        selectedTickets,
        totalAmount: getTotalAmount(),
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8 flex-1">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Banner */}
            <div className="mb-4 md:mb-6 aspect-video overflow-hidden rounded-lg bg-muted">
              {event.banner_url ? (
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-cover bg-center" 
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80')`
                  }}
                >
                  <Ticket className="h-16 w-16 md:h-24 md:w-24 text-white" />
                </div>
              )}
            </div>

            {/* Title and Category */}
            <div className="mb-4 md:mb-6">
              <div className="mb-2 flex items-center gap-2">
                {event.categories && (
                  <Badge variant="secondary">
                    {event.categories.icon} {event.categories.name}
                  </Badge>
                )}
              </div>
              <h1 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold">{event.title}</h1>
              
              {/* Event Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-xs md:text-sm">
                      {format(new Date(event.event_date), 'h:mm a')}
                      {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm md:text-base">{event.venue}</p>
                    <p className="text-xs md:text-sm">{event.location}</p>
                  </div>
                </div>

                {event.total_capacity && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <p className="text-sm md:text-base">Capacity: {event.total_capacity.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4 md:my-6" />

            {/* Description */}
            <div className="mb-4 md:mb-6">
              <h2 className="mb-3 text-xl md:text-2xl font-bold">About This Event</h2>
              <p className="whitespace-pre-wrap text-muted-foreground text-sm md:text-base">{event.description}</p>
            </div>

            <Separator className="my-4 md:my-6" />

            {/* Organizer */}
            <div>
              <h2 className="mb-3 text-xl md:text-2xl font-bold">Organized By</h2>
              <div className="flex items-center gap-3">
                {event.organizers.logo_url ? (
                  <img
                    src={event.organizers.logo_url}
                    alt={event.organizers.organization_name}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {event.organizers.organization_name.charAt(0)}
                  </div>
                )}
                <p className="font-semibold text-sm md:text-base">{event.organizers.organization_name}</p>
              </div>
            </div>
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Select Tickets</CardTitle>
                <CardDescription className="text-xs md:text-sm">Choose your tickets and quantity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                {ticketTypes.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">
                    No tickets available yet
                  </p>
                ) : (
                  <>
                    {ticketTypes.map((ticketType) => {
                      const available = ticketType.quantity_available - ticketType.quantity_sold;
                      const isAvailable = available > 0;

                      return (
                        <div key={ticketType.id} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm md:text-base">{ticketType.name}</p>
                              {ticketType.description && (
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  {ticketType.description}
                                </p>
                              )}
                              <p className="mt-1 text-base md:text-lg font-bold text-primary">
                                KES {ticketType.price.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {available} available
                              </p>
                            </div>
                          </div>

                          {isAvailable ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateTicketQuantity(
                                    ticketType.id,
                                    (selectedTickets[ticketType.id] || 0) - 1
                                  )
                                }
                                disabled={!selectedTickets[ticketType.id]}
                              >
                                -
                              </Button>
                              <span className="w-10 md:w-12 text-center text-sm md:text-base">
                                {selectedTickets[ticketType.id] || 0}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateTicketQuantity(
                                    ticketType.id,
                                    (selectedTickets[ticketType.id] || 0) + 1
                                  )
                                }
                                disabled={
                                  (selectedTickets[ticketType.id] || 0) >= available
                                }
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="destructive">Sold Out</Badge>
                          )}
                        </div>
                      );
                    })}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span>Total Tickets:</span>
                        <span className="font-semibold">{getTotalTickets()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base md:text-lg font-semibold">Total:</span>
                        <span className="text-base md:text-lg font-bold text-primary">
                          KES {getTotalAmount().toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={getTotalTickets() === 0}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ImageSlider />
      <Footer />
    </div>
  );
};

export default EventDetails;