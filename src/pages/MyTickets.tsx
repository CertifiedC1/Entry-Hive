import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Calendar, MapPin, Download, QrCode, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
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
  attendee_email: string;
  attendee_phone: string;
  event: {
    title: string;
    event_date: string;
    end_date: string | null;
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
      // Get current date/time for filtering
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          qr_code,
          status,
          created_at,
          attendee_name,
          attendee_email,
          attendee_phone,
          event:events (
            title,
            event_date,
            end_date,
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
      
      // Filter to only show current and future events
      const filteredTickets = (data || []).filter(ticket => {
        const eventData = ticket.event as TicketWithEvent['event'];
        if (!eventData) return false;
        
        // Use end_date if available, otherwise use event_date
        const eventEndDate = eventData.end_date || eventData.event_date;
        return new Date(eventEndDate) >= new Date();
      });
      
      setTickets(filteredTickets as TicketWithEvent[]);
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

  const downloadTicketPDF = async (ticket: TicketWithEvent) => {
    // Create a simple HTML-based printable ticket
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket - ${ticket.ticket_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .ticket { max-width: 400px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .ticket-header { background: linear-gradient(135deg, #d4a017, #f4c542); padding: 20px; text-align: center; }
          .ticket-header h1 { color: #1a1a1a; font-size: 14px; margin-bottom: 5px; }
          .ticket-header h2 { color: #1a1a1a; font-size: 20px; font-weight: bold; }
          .ticket-body { padding: 25px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .info-label { color: #d4a017; font-size: 11px; text-transform: uppercase; font-weight: 600; }
          .info-value { color: #333; font-size: 14px; margin-top: 3px; }
          .divider { border-top: 2px dashed #e0e0e0; margin: 20px 0; }
          .qr-section { text-align: center; padding: 20px; background: #fafafa; }
          .qr-section h3 { color: #1a1a1a; font-size: 14px; margin-bottom: 15px; background: #d4a017; display: inline-block; padding: 8px 30px; border-radius: 5px; }
          .ticket-id { text-align: center; color: #666; font-size: 12px; margin-top: 15px; font-family: monospace; }
          .logo { text-align: center; padding: 15px; border-top: 1px solid #eee; }
          .logo span { color: #d4a017; font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <h1>🐝 ENTRYHIVE</h1>
            <h2>${ticket.event.title}</h2>
          </div>
          <div class="ticket-body">
            <div class="info-row">
              <div>
                <div class="info-label">Attendee</div>
                <div class="info-value">${ticket.attendee_name}</div>
              </div>
            </div>
            <div class="info-row">
              <div>
                <div class="info-label">Phone Number</div>
                <div class="info-value">${ticket.attendee_phone || 'N/A'}</div>
              </div>
            </div>
            <div class="info-row">
              <div>
                <div class="info-label">Start Date</div>
                <div class="info-value">${new Date(ticket.event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}<br>${new Date(ticket.event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style="text-align: right;">
                <div class="info-label">End Date</div>
                <div class="info-value">${ticket.event.end_date ? new Date(ticket.event.end_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'Same Day'}<br>${ticket.event.end_date ? new Date(ticket.event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
              </div>
            </div>
            <div class="info-row">
              <div>
                <div class="info-label">Venue</div>
                <div class="info-value">${ticket.event.venue}</div>
              </div>
              <div style="text-align: right;">
                <div class="info-label">Ticket Type</div>
                <div class="info-value">${ticket.ticket_type.name}</div>
              </div>
            </div>
            <div class="info-row">
              <div>
                <div class="info-label">Location</div>
                <div class="info-value">${ticket.event.location}</div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="qr-section">
            <h3>TICKET</h3>
            <div id="qr-placeholder" style="width: 180px; height: 180px; margin: 0 auto; border: 2px solid #e0e0e0; display: flex; align-items: center; justify-content: center; background: white;">
              <span style="font-size: 12px; color: #666;">QR Code</span>
            </div>
            <div class="ticket-id">${ticket.id}</div>
          </div>
          <div class="logo">
            <span>🐝 EntryHive</span>
            <p style="font-size: 11px; color: #888; margin-top: 5px;">Thank you for your purchase!</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
    }

    toast({
      title: 'Ticket Ready',
      description: 'Your ticket is ready to print/save as PDF'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <Ticket className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your tickets...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-gradient-gold">My Tickets</span>
          </h1>
          <p className="text-muted-foreground">
            {tickets.length} upcoming ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {tickets.length === 0 ? (
          <Card className="card-interactive">
            <CardContent className="py-12 text-center">
              <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl mb-2">No upcoming tickets</p>
              <p className="text-muted-foreground mb-4">
                Browse events and purchase tickets to see them here
              </p>
              <Button onClick={() => window.location.href = '/events'} className="hover-lift">
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden card-interactive">
                <div className="md:flex">
                  <div className="md:w-48 h-48 md:h-auto bg-muted relative overflow-hidden">
                    {ticket.event.banner_url ? (
                      <img
                        src={ticket.event.banner_url}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Ticket className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">{ticket.event.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Calendar className="h-4 w-4 text-primary" />
                            {new Date(ticket.event.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <MapPin className="h-4 w-4 text-primary" />
                            {ticket.event.venue}, {ticket.event.location}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        ticket.status === 'valid' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                        ticket.status === 'used' ? 'bg-gray-500/10 text-gray-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <p className="text-sm text-muted-foreground mb-1">Ticket Type</p>
                        <p className="font-semibold text-primary">{ticket.ticket_type.name}</p>
                      </div>
                      <div className="flex-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
                        <p className="font-mono text-sm">{ticket.ticket_number}</p>
                      </div>
                      <div className="flex-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <p className="text-sm text-muted-foreground mb-1">Attendee</p>
                        <p className="font-semibold">{ticket.attendee_name}</p>
                      </div>
                    </div>

                    {/* QR Code Display */}
                    <div className="mt-6 pt-6 border-t border-border flex flex-col items-center gap-4">
                      <p className="text-sm font-semibold text-primary">Scan at venue</p>
                      <div className="p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <QRCodeSVG 
                          id={`qr-${ticket.ticket_number}`}
                          value={ticket.qr_code} 
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTicketPDF(ticket)}
                          className="hover-lift click-shrink"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF
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
                          className="hover-lift click-shrink"
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
      <ImageSlider />
      <Footer />
    </div>
  );
};

export default MyTickets;
