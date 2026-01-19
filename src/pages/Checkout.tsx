import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculateSplit } from '@/services/paymentProcessor';

const STORAGE_KEY = 'entryhive_checkout_state';

interface CheckoutState {
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  eventLocation?: string;
  selectedTickets: Record<string, number>;
  ticketDetails?: Record<string, { name: string; price: number }>;
  totalAmount: number;
  attendeeInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

type PaymentStatus = 'idle' | 'initiating' | 'waiting' | 'polling' | 'success' | 'failed';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [stateData, setStateData] = useState<CheckoutState | null>(null);

  // Load state from location.state or sessionStorage
  useEffect(() => {
    const locState = location.state as CheckoutState | undefined;
    if (locState?.eventId && locState?.selectedTickets && locState?.attendeeInfo) {
      // Save to sessionStorage for refresh safety
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(locState));
      setStateData(locState);
      setCustomerInfo(locState.attendeeInfo);
    } else {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CheckoutState;
          if (parsed.eventId && parsed.selectedTickets && parsed.attendeeInfo) {
            setStateData(parsed);
            setCustomerInfo(parsed.attendeeInfo);
            return;
          }
        } catch (e) {
          console.error('Failed to parse stored checkout state:', e);
        }
      }
      // No valid state - redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user && stateData) {
      toast.error('Please sign in to complete your purchase');
      navigate('/auth');
    }
  }, [user, stateData, navigate]);

  const { platformFee, organizerPayout } = stateData ? calculateSplit(stateData.totalAmount) : { platformFee: 0, organizerPayout: 0 };

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId || !stateData) return;

    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*, tickets(*)')
        .eq('id', paymentId)
        .maybeSingle();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      if (payment?.payment_status === 'completed') {
        setPaymentStatus('success');
        toast.success('Payment successful! Redirecting to your tickets...');
        
        // Clear sessionStorage on success
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('entryhive_attendee_state');
        
        // Fetch ticket details with ticket type info
        const { data: tickets } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            qr_code,
            attendee_name,
            ticket_type_id,
            ticket_types(name, price)
          `)
          .eq('payment_id', paymentId);

        // Send ticket email
        try {
          await supabase.functions.invoke('send-ticket-email', {
            body: {
              email: customerInfo.email,
              name: customerInfo.name,
              phone: customerInfo.phone,
              tickets: tickets?.map(t => ({
                ticket_number: t.ticket_number,
                qr_code: t.qr_code,
                ticket_type: (t.ticket_types as any)?.name || 'Standard',
                price: (t.ticket_types as any)?.price || 0
              })) || [],
              eventTitle: stateData.eventTitle || 'Event',
              eventDate: stateData.eventDate || new Date().toISOString(),
              eventVenue: stateData.eventVenue || '',
              eventLocation: stateData.eventLocation || '',
              totalAmount: stateData.totalAmount,
              transactionId: payment.transaction_id || paymentId
            }
          });
          console.log('Ticket email sent successfully');
        } catch (emailError) {
          console.error('Failed to send ticket email:', emailError);
        }

        // Navigate directly to My Tickets page
        setTimeout(() => {
          navigate('/my-tickets');
        }, 1500);
        return;
      }

      if (payment?.payment_status === 'failed') {
        setPaymentStatus('failed');
        toast.error('Payment failed. Please try again.');
        return;
      }

      // Continue polling
      setPollingCount(prev => prev + 1);
    } catch (error) {
      console.error('Payment status check error:', error);
    }
  }, [paymentId, navigate, stateData, customerInfo]);

  // Polling effect
  useEffect(() => {
    if (paymentStatus !== 'polling' && paymentStatus !== 'waiting') return;
    if (pollingCount > 60) { // Stop after 2 minutes (60 * 2 seconds)
      setPaymentStatus('failed');
      toast.error('Payment timeout. Please check your M-Pesa and try again.');
      return;
    }

    const timer = setTimeout(() => {
      checkPaymentStatus();
    }, 2000); // Poll every 2 seconds

    return () => clearTimeout(timer);
  }, [paymentStatus, pollingCount, checkPaymentStatus]);

  if (!stateData) {
    return null;
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to complete your purchase');
      navigate('/auth');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please provide your name, email, and phone number');
      return;
    }

    setPaymentStatus('initiating');
    setPollingCount(0);

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          eventId: stateData.eventId,
          tickets: Object.entries(stateData.selectedTickets)
            .filter(([_, qty]) => qty > 0)
            .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity })),
          paymentMethod: 'mpesa',
          customerInfo: customerInfo,
          totalAmount: stateData.totalAmount
        }
      });

      if (error) throw error;

      if (data?.success) {
        setPaymentId(data.paymentId);
        setPaymentStatus('waiting');
        toast.info('Please check your phone for the M-Pesa prompt', {
          duration: 10000
        });
        
        // Start polling after a short delay
        setTimeout(() => {
          setPaymentStatus('polling');
        }, 5000);
      } else {
        throw new Error(data?.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setPaymentId(null);
    setPollingCount(0);
  };

  const isProcessing = paymentStatus !== 'idle' && paymentStatus !== 'failed';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto max-w-4xl px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Method */}
          <div className="space-y-6">
            <Card className="border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pay with M-PESA</CardTitle>
                  <Badge variant="outline" className="text-green-500 border-green-500">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* MPESA Info */}
                <div className="rounded-lg border border-green-500 bg-green-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-green-500" />
                    <div className="flex-1">
                      <p className="font-semibold">M-PESA</p>
                      <p className="text-sm text-muted-foreground">
                        Safaricom M-PESA Payment
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>

                {/* Payment Status */}
                {paymentStatus === 'waiting' || paymentStatus === 'polling' ? (
                  <div className="rounded-lg border border-amber-500 bg-amber-500/10 p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-amber-500 animate-spin" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-600">Waiting for Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Check your phone for the M-PESA prompt and enter your PIN
                        </p>
                      </div>
                    </div>
                  </div>
                ) : paymentStatus === 'success' ? (
                  <div className="rounded-lg border border-green-500 bg-green-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-600">Payment Successful!</p>
                        <p className="text-sm text-muted-foreground">
                          Redirecting to your tickets...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : paymentStatus === 'failed' ? (
                  <div className="rounded-lg border border-red-500 bg-red-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-6 w-6 text-red-500" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-600">Payment Failed</p>
                        <p className="text-sm text-muted-foreground">
                          Please try again or contact support
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You will receive an STK push on your phone to complete the payment.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{customerInfo.name}</p>
                  <p>{customerInfo.email}</p>
                  <p>{customerInfo.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stateData.eventTitle && (
                  <div className="pb-4 border-b">
                    <p className="font-semibold">{stateData.eventTitle}</p>
                    {stateData.eventDate && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(stateData.eventDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  {stateData.ticketDetails && Object.entries(stateData.selectedTickets)
                    .filter(([_, qty]) => qty > 0)
                    .map(([ticketId, qty]) => {
                      const ticket = stateData.ticketDetails?.[ticketId];
                      return ticket ? (
                        <div key={ticketId} className="flex justify-between text-sm">
                          <span>{ticket.name} x{qty}</span>
                          <span>KES {(ticket.price * qty).toLocaleString()}</span>
                        </div>
                      ) : null;
                    })}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>KES {stateData.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes:</span>
                    <span>KES 0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">KES {stateData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {paymentStatus === 'failed' ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleRetry}
                  >
                    Try Again
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing || !customerInfo.name || !customerInfo.email || !customerInfo.phone}
                  >
                    {paymentStatus === 'initiating' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating Payment...
                      </>
                    ) : paymentStatus === 'waiting' || paymentStatus === 'polling' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Waiting for M-PESA...
                      </>
                    ) : paymentStatus === 'success' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Payment Complete
                      </>
                    ) : (
                      <>
                        <Smartphone className="mr-2 h-4 w-4" />
                        Pay with M-PESA
                      </>
                    )}
                  </Button>
                )}
                
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment via Lipana. Your tickets will be delivered instantly.
                </p>
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

export default Checkout;
