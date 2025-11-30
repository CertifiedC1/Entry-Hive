import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Calendar, MapPin, Download, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface TicketWithEvent {
  id: string;
  ticket_number: string;
  qr_code: string;
  status: string;
  created_at: string;
  attendee_name: string;
  event: {
    title: string;
    event_date: string;
    venue: string;
    location: string;
    banner_url: string;
  };
  ticket_type: {
    name: string;
    price: number;
  };
}

const MyTickets = () => {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          qr_code,
          status,
          created_at,
          attendee_name,
          event:events (
            title,
            event_date,
            venue,
            location,
            banner_url
          ),
          ticket_type:ticket_types (
            name,
            price
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket: TicketWithEvent) => {
    // Generate ticket data as JSON
    const ticketData = JSON.stringify({
      ticketNumber: ticket.ticket_number,
      qrCode: ticket.qr_code,
      event: ticket.event.title,
      attendee: ticket.attendee_name,
      date: new Date(ticket.event.event_date).toLocaleDateString(),
      venue: ticket.event.venue
    }, null, 2);

    const blob = new Blob([ticketData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.ticket_number}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Ticket Downloaded',
      description: 'Your ticket has been downloaded successfully'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading your tickets...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Ticket className="h-8 w-8" />
            My Tickets
          </h1>
          <p className="text-muted-foreground">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} purchased
          </p>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl mb-2">No tickets yet</p>
              <p className="text-muted-foreground mb-4">
                Browse events and purchase tickets to see them here
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-48 h-48 md:h-auto bg-muted">
                    {ticket.event.banner_url ? (
                      <img
                        src={ticket.event.banner_url}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Ticket className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{ticket.event.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(ticket.event.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {ticket.event.venue}, {ticket.event.location}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === 'valid' ? 'bg-green-500/10 text-green-500' :
                        ticket.status === 'used' ? 'bg-gray-500/10 text-gray-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Ticket Type</p>
                        <p className="font-semibold">{ticket.ticket_type.name}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
                        <p className="font-mono text-sm">{ticket.ticket_number}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Attendee</p>
                        <p className="font-semibold">{ticket.attendee_name}</p>
                      </div>
                    </div>

                    {/* QR Code Display */}
                    <div className="mt-6 pt-6 border-t flex flex-col items-center gap-4">
                      <p className="text-sm font-semibold text-muted-foreground">Scan at venue</p>
                      <QRCodeSVG 
                        id={`qr-${ticket.ticket_number}`}
                        value={ticket.qr_code} 
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTicket(ticket)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(ticket.qr_code);
                            toast({
                              title: 'QR Code Copied',
                              description: 'QR code data copied to clipboard'
                            });
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Copy QR
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyTickets;
