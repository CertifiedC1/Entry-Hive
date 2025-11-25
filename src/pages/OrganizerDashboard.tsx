import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Calendar, Ticket, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Organizer {
  id: string;
  organization_name: string;
  verified: boolean;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  published: boolean;
  venue: string;
  ticket_types: Array<{
    quantity_sold: number;
    price: number;
  }>;
}

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (user) {
      checkOrganizerStatus();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const checkOrganizerStatus = async () => {
    try {
      const { data: organizerData, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (organizerData) {
        setOrganizer(organizerData);
        fetchEvents(organizerData.id);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error checking organizer status:', error);
      toast.error('Failed to load organizer profile');
      setLoading(false);
    }
  };

  const fetchEvents = async (organizerId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (quantity_sold, price)
        `)
        .eq('organizer_id', organizerId)
        .order('event_date', { ascending: false });

      if (error) throw error;

      setEvents(data || []);

      // Calculate stats
      const totalTicketsSold = data?.reduce(
        (sum, event) =>
          sum +
          event.ticket_types.reduce((ticketSum, tt) => ticketSum + tt.quantity_sold, 0),
        0
      ) || 0;

      const totalRevenue = data?.reduce(
        (sum, event) =>
          sum +
          event.ticket_types.reduce(
            (ticketSum, tt) => ticketSum + tt.quantity_sold * Number(tt.price),
            0
          ),
        0
      ) || 0;

      setStats({
        totalEvents: data?.length || 0,
        totalTicketsSold,
        totalRevenue,
      });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createOrganizerProfile = async () => {
    navigate('/create-organizer');
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

  if (!organizer) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Become an Event Organizer</CardTitle>
              <CardDescription>
                Create an organizer profile to start hosting events on Tiko
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={createOrganizerProfile} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Organizer Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{organizer.organization_name}</h1>
            <p className="text-muted-foreground">Organizer Dashboard</p>
          </div>
          <Button onClick={() => navigate('/create-event')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>Manage and track all your events</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">You haven't created any events yet</p>
                <Button onClick={() => navigate('/create-event')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const ticketsSold = event.ticket_types.reduce(
                    (sum, tt) => sum + tt.quantity_sold,
                    0
                  );
                  const revenue = event.ticket_types.reduce(
                    (sum, tt) => sum + tt.quantity_sold * Number(tt.price),
                    0
                  );

                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString()} • {event.venue}
                        </p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span>Tickets Sold: {ticketsSold}</span>
                          <span>Revenue: KES {revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/events/${event.id}`)}>
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
