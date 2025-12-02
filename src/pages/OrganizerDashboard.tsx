import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Loader2, Calendar, Ticket, TrendingUp, Eye, Edit, Trash2, 
  BarChart3, Users, QrCode, Settings, Bell, DollarSign, Clock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Organizer {
  id: string;
  organization_name: string;
  verified: boolean;
  contact_email: string | null;
  contact_phone: string | null;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  published: boolean;
  venue: string;
  location: string;
  banner_url: string | null;
  ticket_types: Array<{
    id: string;
    name: string;
    quantity_sold: number;
    quantity_available: number;
    price: number;
  }>;
}

interface RecentScan {
  id: string;
  scanned_at: string;
  tickets: {
    attendee_name: string | null;
    ticket_types: {
      name: string;
    };
  };
}

const OrganizerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeEvents: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        checkOrganizerStatus();
      }
    }
  }, [user, authLoading, navigate]);

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
        await Promise.all([
          fetchEvents(organizerData.id),
          fetchRecentScans(organizerData.id),
        ]);
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
          ticket_types (id, name, quantity_sold, quantity_available, price)
        `)
        .eq('organizer_id', organizerId)
        .order('event_date', { ascending: false });

      if (error) throw error;

      setEvents(data || []);

      const now = new Date();
      const activeEvents = data?.filter(e => new Date(e.event_date) >= now && e.published).length || 0;

      const totalTicketsSold = data?.reduce(
        (sum, event) =>
          sum + event.ticket_types.reduce((ticketSum, tt) => ticketSum + tt.quantity_sold, 0),
        0
      ) || 0;

      const totalRevenue = data?.reduce(
        (sum, event) =>
          sum + event.ticket_types.reduce(
            (ticketSum, tt) => ticketSum + tt.quantity_sold * Number(tt.price),
            0
          ),
        0
      ) || 0;

      setStats({
        totalEvents: data?.length || 0,
        totalTicketsSold,
        totalRevenue,
        activeEvents,
      });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentScans = async (organizerId: string) => {
    try {
      const { data: eventIds } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId);

      if (!eventIds || eventIds.length === 0) return;

      const { data } = await supabase
        .from('scans')
        .select(`
          id,
          scanned_at,
          tickets (
            attendee_name,
            ticket_types (name)
          )
        `)
        .order('scanned_at', { ascending: false })
        .limit(5);

      setRecentScans(data as any || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully');
      if (organizer) fetchEvents(organizer.id);
    } catch (error: any) {
      toast.error('Failed to delete event');
    }
  };

  const handlePublishToggle = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ published: !currentStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast.success(currentStatus ? 'Event unpublished' : 'Event published');
      if (organizer) fetchEvents(organizer.id);
    } catch (error: any) {
      toast.error('Failed to update event');
    }
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.event_date);
    const now = new Date();
    
    if (!event.published) return { label: 'Draft', variant: 'secondary' as const };
    if (eventDate < now) return { label: 'Past', variant: 'outline' as const };
    
    const totalAvailable = event.ticket_types.reduce((sum, tt) => sum + tt.quantity_available, 0);
    const totalSold = event.ticket_types.reduce((sum, tt) => sum + tt.quantity_sold, 0);
    
    if (totalSold >= totalAvailable) return { label: 'Sold Out', variant: 'destructive' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  const getLowTicketEvents = () => {
    return events.filter(event => {
      const totalRemaining = event.ticket_types.reduce(
        (sum, tt) => sum + (tt.quantity_available - tt.quantity_sold), 0
      );
      return totalRemaining > 0 && totalRemaining < 10;
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(e => new Date(e.event_date) >= now && e.published)
      .slice(0, 3);
  };

  if (authLoading || loading) {
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
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div 
          className="flex-1 flex items-center justify-center py-12"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Card className="max-w-md mx-4 backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center">
              <CardTitle>Become an Event Organizer</CardTitle>
              <CardDescription>
                Create an organizer profile to start hosting events on Tiko
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/create-organizer')} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Organizer Profile
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const lowTicketEvents = getLowTicketEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{organizer.organization_name}</h1>
                  {organizer.verified && (
                    <Badge variant="default" className="bg-green-500">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Organizer Dashboard</p>
              </div>
              <Button onClick={() => navigate('/create-event')} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">{stats.activeEvents} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalTicketsSold}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeEvents}</div>
                <p className="text-xs text-muted-foreground">Currently selling</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Low Ticket Alerts */}
            {lowTicketEvents.length > 0 && (
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-500">
                    <AlertTriangle className="h-5 w-5" />
                    Low Ticket Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lowTicketEvents.map(event => (
                    <div key={event.id} className="flex justify-between items-center text-sm">
                      <span className="truncate">{event.title}</span>
                      <Badge variant="destructive">
                        {event.ticket_types.reduce((sum, tt) => sum + (tt.quantity_available - tt.quantity_sold), 0)} left
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                ) : (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="space-y-1">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.venue}</p>
                      <p className="text-xs text-primary">
                        {format(new Date(event.event_date), 'PPP')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Recent Ticket Scans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentScans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent scans</p>
                ) : (
                  recentScans.map(scan => (
                    <div key={scan.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{scan.tickets?.attendee_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{scan.tickets?.ticket_types?.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(scan.scanned_at), 'HH:mm')}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Events</CardTitle>
                  <CardDescription>Manage and track all your events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/ticket-scanner')}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Ticket Scanner
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="mb-4 text-muted-foreground">You haven't created any events yet</p>
                  <Button onClick={() => navigate('/create-event')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => {
                    const ticketsSold = event.ticket_types.reduce((sum, tt) => sum + tt.quantity_sold, 0);
                    const totalTickets = event.ticket_types.reduce((sum, tt) => sum + tt.quantity_available, 0);
                    const revenue = event.ticket_types.reduce(
                      (sum, tt) => sum + tt.quantity_sold * Number(tt.price), 0
                    );
                    const status = getEventStatus(event);

                    return (
                      <div
                        key={event.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hidden md:block">
                          <img
                            src={event.banner_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80'}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{event.title}</h3>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.event_date), 'PPP')} • {event.venue}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Ticket className="h-4 w-4" />
                              {ticketsSold}/{totalTickets} sold
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              KES {revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePublishToggle(event.id, event.published)}
                          >
                            {event.published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
