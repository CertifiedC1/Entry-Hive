import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScanLine, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const handleScan = async () => {
    if (!qrCode.trim()) {
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
      // Fetch ticket details
      const { data: ticket, error } = await supabase
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
        .eq('qr_code', qrCode.trim())
        .single();

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

  const resetScanner = () => {
    setQrCode('');
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ScanLine className="h-6 w-6" />
                Ticket Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Enter or Scan QR Code
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Scan or paste QR code here..."
                    className="flex-1"
                    disabled={scanning}
                  />
                  <Button 
                    onClick={handleScan}
                    disabled={scanning || !qrCode.trim()}
                  >
                    {scanning ? 'Validating...' : 'Validate'}
                  </Button>
                </div>
              </div>

              {scanResult && (
                <div className={`p-6 rounded-lg border-2 ${
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
                      <li>Scan or manually enter the QR code from the ticket</li>
                      <li>Each ticket can only be validated once</li>
                      <li>Used tickets will be marked and cannot be reused</li>
                      <li>All scans are logged for security purposes</li>
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