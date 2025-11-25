import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutState {
  eventId: string;
  selectedTickets: Record<string, number>;
  totalAmount: number;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'stripe' | 'paypal'>('mpesa');
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const state = location.state as CheckoutState;

  useEffect(() => {
    if (!user || !state) {
      navigate('/');
    }
  }, [user, state, navigate]);

  if (!state) {
    return null;
  }

  const handlePayment = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      if (paymentMethod === 'mpesa') {
        if (!phoneNumber || phoneNumber.length < 10) {
          toast.error('Please enter a valid phone number');
          setProcessing(false);
          return;
        }

        // Call Mpesa payment edge function
        const { data, error } = await supabase.functions.invoke('process-mpesa-payment', {
          body: {
            phoneNumber,
            amount: state.totalAmount,
            eventId: state.eventId,
            selectedTickets: state.selectedTickets,
          },
        });

        if (error) throw error;
        
        toast.success('Payment initiated! Please check your phone for the M-Pesa prompt.');
        toast.info('You will receive your tickets via email and SMS once payment is confirmed.');
        
        // Redirect to success page
        setTimeout(() => {
          navigate('/my-tickets');
        }, 3000);
      } else if (paymentMethod === 'stripe') {
        // Call Stripe payment edge function
        const { data, error } = await supabase.functions.invoke('process-stripe-payment', {
          body: {
            amount: state.totalAmount,
            eventId: state.eventId,
            selectedTickets: state.selectedTickets,
          },
        });

        if (error) throw error;

        if (data.url) {
          window.location.href = data.url;
        }
      } else if (paymentMethod === 'paypal') {
        // Call PayPal payment edge function
        const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
          body: {
            amount: state.totalAmount,
            eventId: state.eventId,
            selectedTickets: state.selectedTickets,
          },
        });

        if (error) throw error;

        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>Choose your payment method and complete the transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">Order Summary</h3>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="text-lg font-bold text-primary">
                  KES {state.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex flex-1 cursor-pointer items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">M-Pesa</p>
                      <p className="text-sm text-muted-foreground">Pay via M-Pesa STK Push</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex flex-1 cursor-pointer items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, etc.</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex flex-1 cursor-pointer items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">PayPal</p>
                      <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* M-Pesa Phone Number Input */}
            {paymentMethod === 'mpesa' && (
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your M-Pesa registered phone number (e.g., 254712345678)
                </p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'mpesa' && !phoneNumber)}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay KES ${state.totalAmount.toLocaleString()}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
