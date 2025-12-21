import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Ticket, Calendar, MapPin, Download, Mail, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TicketInfo {
  id: string;
  ticket_number: string;
  qr_code: string;
  attendee_name: string;
  ticket_type: string;
  price: number;
}

interface PaymentSuccessState {
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventLocation: string;
  tickets: TicketInfo[];
  totalAmount: number;
  transactionId: string;
}

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentSuccessState | null>(null);

  useEffect(() => {
    if (location.state) {
      setState(location.state as PaymentSuccessState);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handlePrintTicket = (ticketNumber: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !state) return;

    const ticket = state.tickets.find(t => t.ticket_number === ticketNumber);
    if (!ticket) return;

    const qrElement = document.getElementById(`qr-${ticketNumber}`);
    const qrSvg = qrElement?.outerHTML || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EntryHive Ticket - ${ticketNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .ticket { max-width: 600px; margin: 0 auto; border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; }
          .header { text-align: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; }
          .event-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .detail { }
          .label { color: #6b7280; font-size: 12px; margin-bottom: 4px; }
          .value { font-weight: 600; }
          .qr-section { text-align: center; padding: 20px; background: #f9fafb; border-radius: 12px; }
          .qr-section svg { display: block; margin: 0 auto; }
          .ticket-number { font-family: monospace; font-size: 14px; margin-top: 10px; color: #374151; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="logo">🐝 EntryHive</div>
            <div class="event-title">${state.eventTitle}</div>
          </div>
          <div class="details">
            <div class="detail">
              <div class="label">Date & Time</div>
              <div class="value">${new Date(state.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="detail">
              <div class="label">Venue</div>
              <div class="value">${state.eventVenue}, ${state.eventLocation}</div>
            </div>
            <div class="detail">
              <div class="label">Attendee</div>
              <div class="value">${ticket.attendee_name}</div>
            </div>
            <div class="detail">
              <div class="label">Ticket Type</div>
              <div class="value">${ticket.ticket_type}</div>
            </div>
          </div>
          <div class="qr-section">
            ${qrSvg}
            <div class="ticket-number">Ticket #: ${ticket.ticket_number}</div>
          </div>
          <div class="footer">
            <p>Present this QR code at the venue for entry</p>
            <p>This ticket is valid for single use only</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto max-w-4xl px-4 py-8 flex-1">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your tickets have been confirmed and sent to your email
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Transaction ID: <span className="font-mono">{state.transactionId}</span>
          </p>
        </div>

        {/* Event Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              {state.eventTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(state.eventDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{state.eventVenue}, {state.eventLocation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets */}
        <h2 className="text-xl font-semibold mb-4">Your Tickets ({state.tickets.length})</h2>
        <div className="space-y-4 mb-8">
          {state.tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <QRCodeSVG 
                      id={`qr-${ticket.ticket_number}`}
                      value={ticket.qr_code}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="text-xs font-mono mt-2 text-muted-foreground">
                      {ticket.ticket_number}
                    </p>
                  </div>

                  {/* Ticket Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Attendee</p>
                      <p className="font-semibold">{ticket.attendee_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Type</p>
                      <p className="font-semibold">{ticket.ticket_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold text-primary">KES {ticket.price.toLocaleString()}</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintTicket(ticket.ticket_number)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(ticket.qr_code);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Copy QR Data
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-primary">KES {state.totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Tickets sent to your email</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/my-tickets">
            <Button size="lg">
              <Ticket className="h-4 w-4 mr-2" />
              View All My Tickets
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="lg">
              Browse More Events
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
