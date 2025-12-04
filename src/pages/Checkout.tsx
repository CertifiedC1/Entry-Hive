import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutState {
  eventId: string;
  selectedTickets: Record<string, number>;
  totalAmount: number;
  attendeeInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'paystack'>('paystack');
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const state = location.state as CheckoutState;

  useEffect(() => {
    if (!user || !state) {
      navigate('/');
      return;
    }
    
    // Set customer info from attendee details
    if (state.attendeeInfo) {
      setCustomerInfo(state.attendeeInfo);
    }
  }, [user, state, navigate]);

  if (!state) {
    return null;
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to complete your purchase');
      navigate('/auth');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please provide your name and email');
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          eventId: state.eventId,
          tickets: Object.entries(state.selectedTickets)
            .filter(([_, qty]) => qty > 0)
            .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity })),
          paymentMethod: paymentMethod,
          customerInfo: customerInfo,
          totalAmount: state.totalAmount
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Payment successful! Your tickets have been sent to your email');
        navigate('/my-tickets');
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto max-w-4xl px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Method */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pay with</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">Paystack</p>
                      <p className="text-sm text-muted-foreground">
                        Secure payment via Paystack - Cards, Bank Transfer, Mobile Money
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment is processed securely through Paystack. Supports Visa, Mastercard, Bank Transfer, and Mobile Money.
                </p>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>KES {state.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes:</span>
                    <span>KES 0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">KES {state.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={processing || !customerInfo.name || !customerInfo.email}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment processing. Your tickets will be delivered within 30 seconds.
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
