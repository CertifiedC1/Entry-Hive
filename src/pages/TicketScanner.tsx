import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScanLine, CheckCircle, XCircle, AlertTriangle, Camera, Keyboard, Shield, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from '@/components/QRScanner';
import { parseQRCode, getSearchIdentifiers } from '@/lib/qr-parser';

interface OrganizerEvent {
  id: string;
  title: string;
  event_date: string;
}

interface ScanResult {
  success: boolean;
  ticket?: {
    ticket_number: string;
    attendee_name: string;
    status: string;
    event: {
      title: string;
      event_date: string;
      venue: string;
    };
    ticket_type: {
      name: string;
    };
  };
  message: string;
}

const TicketScanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [organizerEvents, setOrganizerEvents] = useState<OrganizerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkOrganizerStatus();
    }
  }, [user]);

  const checkOrganizerStatus = async () => {
    try {
      // Check if user is an organizer and fetch their events
      const { data: organizer, error: orgError } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (orgError) throw orgError;

      if (organizer) {
        setIsOrganizer(true);
        
        // Fetch events for this organizer
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, title, event_date')
          .eq('organizer_id', organizer.id)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true });

        if (eventsError) throw eventsError;
        setOrganizerEvents(events || []);
        
        if (events && events.length > 0) {
          setSelectedEventId(events[0].id);
        }
      } else {
        setIsOrganizer(false);
      }
    } catch (error) {
      console.error('Error checking organizer status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (code?: string) => {
    const codeToScan = code || qrCode;
    
    if (!codeToScan.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a QR code',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedEventId) {
      toast({
        title: 'Error',
        description: 'Please select an event to scan tickets for',
        variant: 'destructive'
      });
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      // Parse QR code data using the parser
      const parsed = parseQRCode(codeToScan);
      const identifiers = getSearchIdentifiers(parsed);
      
      console.log('Parsed QR:', parsed);
      console.log('Search identifiers:', identifiers);
      
      let ticket = null;

      // Strategy 1: If we have a ticket ID from SDTS format, search by ID first
      if (identifiers.ticketId) {
        const { data } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            attendee_name,
            status,
            qr_code,
            user_id,
            event_id,
            event:events (
              title,
              event_date,
              venue,
              organizer_id
            ),
            ticket_type:ticket_types (
              name
            )
          `)
          .eq('id', identifiers.ticketId)
          .maybeSingle();
        
        if (data) {
          ticket = data;
        }
      }

      // Strategy 2: Try exact match with full QR code
      if (!ticket) {
        const { data } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            attendee_name,
            status,
            qr_code,
            user_id,
            event_id,
            event:events (
              title,
              event_date,
              venue,
              organizer_id
            ),
            ticket_type:ticket_types (
              name
            )
          `)
          .eq('qr_code', identifiers.qrCode)
          .maybeSingle();
        
        if (data) {
          ticket = data;
        }
      }

      // Strategy 3: Try matching by ticket_number
      if (!ticket && identifiers.ticketNumber) {
        const { data } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            attendee_name,
            status,
            qr_code,
            user_id,
            event_id,
            event:events (
              title,
              event_date,
              venue,
              organizer_id
            ),
            ticket_type:ticket_types (
              name
            )
          `)
          .eq('ticket_number', identifiers.ticketNumber)
          .maybeSingle();
        
        if (data) {
          ticket = data;
        }
      }

      if (!ticket) {
        setScanResult({
          success: false,
          message: 'Ticket not found. The QR code may be invalid or corrupted.'
        });
        return;
      }

      // SECURITY CHECK: Verify this ticket is for the selected event
      if (ticket.event_id !== selectedEventId) {
        setScanResult({
          success: false,
          ticket: ticket as any,
          message: 'This ticket is for a different event. You can only validate tickets for your own events.'
        });
        return;
      }

      // Check ticket status
      if (ticket.status === 'used') {
        setScanResult({
          success: false,
          ticket: ticket as any,
          message: 'This ticket has already been used.'
        });
        return;
      }

      if (ticket.status === 'cancelled') {
        setScanResult({
          success: false,
          ticket: ticket as any,
          message: 'This ticket has been cancelled.'
        });
        return;
      }

      // Mark ticket as used
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Record scan
      const eventData = ticket.event as { title: string; event_date: string; venue: string } | null;
      await supabase
        .from('scans')
        .insert({
          ticket_id: ticket.id,
          scanned_by: user?.id,
          location: eventData?.venue || 'Unknown'
        });

      setScanResult({
        success: true,
        ticket: ticket as any,
        message: 'Ticket validated successfully!'
      });

      toast({
        title: 'Success',
        description: 'Ticket validated and marked as used'
      });

    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        message: 'Failed to validate ticket. Please try again.'
      });
      toast({
        title: 'Error',
        description: 'Failed to validate ticket',
        variant: 'destructive'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const handleCameraScan = (result: string) => {
    setQrCode(result);
    handleScan(result);
  };

  const resetScanner = () => {
    setQrCode('');
    setScanResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <ScanLine className="h-16 w-16 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading scanner...</p>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="backdrop-blur-sm bg-card/95">
              <CardContent className="py-12 text-center">
                <Lock className="h-16 w-16 mx-auto mb-4 text-destructive" />
                <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                <p className="text-muted-foreground mb-6">
                  Only event organizers can access the ticket scanner. This prevents unauthorized ticket validation and protects against fraud.
                </p>
                <Button onClick={() => window.location.href = '/events'} className="hover-lift">
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (organizerEvents.length === 0) {
    return (
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="backdrop-blur-sm bg-card/95">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
                <h2 className="text-2xl font-bold mb-4">No Upcoming Events</h2>
                <p className="text-muted-foreground mb-6">
                  You don't have any upcoming events to scan tickets for. Create an event first!
                </p>
                <Button onClick={() => window.location.href = '/organizer'} className="hover-lift">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-card/95 card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ScanLine className="h-6 w-6 text-primary" />
                <span className="text-gradient-gold">Ticket Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Selection */}
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <label className="text-sm font-medium mb-2 block text-primary">
                  Select Event to Validate
                </label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizerEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  You can only validate tickets for your own events
                </p>
              </div>

              <Tabs defaultValue="camera" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="camera" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Camera
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="camera" className="space-y-4 mt-4">
                  <QRScanner 
                    onScan={handleCameraScan}
                    onError={(error) => toast({
                      title: 'Camera Error',
                      description: error,
                      variant: 'destructive'
                    })}
                    showValidateButton={true}
                  />
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Enter QR Code Manually
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Paste QR code here..."
                        className="flex-1"
                        disabled={scanning}
                      />
                      <Button 
                        onClick={() => handleScan()}
                        disabled={scanning || !qrCode.trim()}
                        className="hover-lift click-shrink"
                      >
                        {scanning ? 'Validating...' : 'Validate'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {scanResult && (
                <div className={`p-6 rounded-lg border-2 animate-fade-in ${
                  scanResult.success 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-red-500 bg-red-500/10'
                }`}>
                  <div className="flex items-start gap-4">
                    {scanResult.success ? (
                      <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        scanResult.success ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {scanResult.success ? 'Valid Ticket' : 'Invalid Ticket'}
                      </h3>
                      <p className="mb-4">{scanResult.message}</p>

                      {scanResult.ticket && (
                        <div className="space-y-2 bg-background/50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Event</p>
                              <p className="font-semibold">{scanResult.ticket.event.title}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Ticket Type</p>
                              <p className="font-semibold">{scanResult.ticket.ticket_type.name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Attendee</p>
                              <p className="font-semibold">{scanResult.ticket.attendee_name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Ticket #</p>
                              <p className="font-mono text-xs">{scanResult.ticket.ticket_number}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1 text-primary">Organizer-Only Validation</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Only you can validate tickets for your events</li>
                      <li>Prevents fraud from unauthorized scanning</li>
                      <li>Each ticket can only be used once</li>
                      <li>All scans are logged with timestamp & location</li>
                    </ul>
                  </div>
                </div>
              </div>

              {scanResult && (
                <Button 
                  onClick={resetScanner}
                  variant="outline"
                  className="w-full hover-lift"
                >
                  Scan Another Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TicketScanner;
