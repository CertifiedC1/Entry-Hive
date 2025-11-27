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
              <Label>Payment Method</Label>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">Paystack</p>
                    <p className="text-sm text-muted-foreground">Secure payment via Paystack - Cards, Bank Transfer, Mobile Money</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment is processed securely through Paystack. Supports Visa, Mastercard, Bank Transfer, and Mobile Money.
              </p>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Your tickets will be sent to this email address
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
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
                `Pay KES ${state.totalAmount.toLocaleString()}`
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              Secure payment processing. Your tickets will be delivered within 30 seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
