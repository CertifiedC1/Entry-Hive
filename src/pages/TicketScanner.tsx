import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, CheckCircle, XCircle, AlertTriangle, Camera, Keyboard } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from '@/components/QRScanner';

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
  const { user } = useAuth();
  const { toast } = useToast();

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

    setScanning(true);
    setScanResult(null);

    try {
      // First try exact match with qr_code
      let { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          attendee_name,
          status,
          qr_code,
          event:events (
            title,
            event_date,
            venue
          ),
          ticket_type:ticket_types (
            name
          )
        `)
        .eq('qr_code', codeToScan.trim())
        .single();

      // If not found, try matching by ticket_number (in case QR contains ticket number)
      if (error || !ticket) {
        const { data: ticketByNumber, error: numberError } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            attendee_name,
            status,
            qr_code,
            event:events (
              title,
              event_date,
              venue
            ),
            ticket_type:ticket_types (
              name
            )
          `)
          .eq('ticket_number', codeToScan.trim())
          .single();
        
        if (!numberError && ticketByNumber) {
          ticket = ticketByNumber;
          error = null;
        }
      }

      // If still not found, try partial match (QR code contains the scanned value)
      if (error || !ticket) {
        const { data: tickets, error: likeError } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            attendee_name,
            status,
            qr_code,
            event:events (
              title,
              event_date,
              venue
            ),
            ticket_type:ticket_types (
              name
            )
          `)
          .ilike('qr_code', `%${codeToScan.trim()}%`)
          .limit(1);
        
        if (!likeError && tickets && tickets.length > 0) {
          ticket = tickets[0];
          error = null;
        }
      }

      if (error || !ticket) {
        setScanResult({
          success: false,
          message: 'Ticket not found. Invalid QR code.'
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
        throw updateError;
      }

      // Record scan
      await supabase
        .from('scans')
        .insert({
          ticket_id: ticket.id,
          scanned_by: user?.id,
          location: ticket.event.venue
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ScanLine className="h-6 w-6" />
                Ticket Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Scanner Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Use camera to scan QR codes directly</li>
                      <li>Or manually enter the QR code text</li>
                      <li>Each ticket can only be validated once</li>
                      <li>All scans are logged for security</li>
                    </ul>
                  </div>
                </div>
              </div>

              {scanResult && (
                <Button 
                  onClick={resetScanner}
                  variant="outline"
                  className="w-full"
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
