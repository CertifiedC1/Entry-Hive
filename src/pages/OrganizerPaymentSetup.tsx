import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const OrganizerPaymentSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState({
    mpesa_shortcode: '',
    mpesa_api_key: '',
    mpesa_api_secret: '',
    mpesa_passkey: '',
    mpesa_callback_url: '',
    paypal_email: '',
    paypal_connected: false,
    stripe_connected: false,
    payment_setup_complete: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkOrganizerStatus();
  }, [user]);

  const checkOrganizerStatus = async () => {
    try {
      const { data: organizer, error } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error || !organizer) {
        toast.error('You need to be an organizer to access this page');
        navigate('/create-organizer');
        return;
      }

      setOrganizerId(organizer.id);
      
      // Generate callback URL
      const callbackUrl = `${window.location.origin}/api/mpesa/callback/${organizer.id}`;
      
      // Check for existing payment settings
      const { data: settings } = await supabase
        .from('organizer_payment_settings')
        .select('*')
        .eq('organizer_id', organizer.id)
        .single();

      if (settings) {
        setPaymentSettings({
          ...settings,
          mpesa_callback_url: callbackUrl
        });
      } else {
        setPaymentSettings(prev => ({
          ...prev,
          mpesa_callback_url: callbackUrl
        }));
      }
    } catch (error) {
      console.error('Error checking organizer status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMpesaSettings = async () => {
    if (!organizerId) return;
    
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('organizer_payment_settings')
        .select('id')
        .eq('organizer_id', organizerId)
        .single();

      const settingsData = {
        organizer_id: organizerId,
        mpesa_shortcode: paymentSettings.mpesa_shortcode,
        mpesa_api_key: paymentSettings.mpesa_api_key,
        mpesa_api_secret: paymentSettings.mpesa_api_secret,
        mpesa_passkey: paymentSettings.mpesa_passkey,
        mpesa_callback_url: paymentSettings.mpesa_callback_url,
        payment_setup_complete: paymentSettings.mpesa_shortcode !== '' || 
                                paymentSettings.paypal_connected || 
                                paymentSettings.stripe_connected
      };

      if (existing) {
        await supabase
          .from('organizer_payment_settings')
          .update(settingsData)
          .eq('organizer_id', organizerId);
      } else {
        await supabase
          .from('organizer_payment_settings')
          .insert(settingsData);
      }

      toast.success('MPESA settings saved successfully');
      setPaymentSettings(prev => ({
        ...prev,
        payment_setup_complete: true
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectPayPal = async () => {
    if (!organizerId) return;
    
    // Simulate PayPal connection
    toast.info('PayPal connection simulated (Test Mode)');
    
    try {
      const { data: existing } = await supabase
        .from('organizer_payment_settings')
        .select('id')
        .eq('organizer_id', organizerId)
        .single();

      const updateData = {
        organizer_id: organizerId,
        paypal_connected: true,
        paypal_email: 'connected@paypal.com',
        payment_setup_complete: true
      };

      if (existing) {
        await supabase
          .from('organizer_payment_settings')
          .update(updateData)
          .eq('organizer_id', organizerId);
      } else {
        await supabase
          .from('organizer_payment_settings')
          .insert(updateData);
      }

      setPaymentSettings(prev => ({
        ...prev,
        paypal_connected: true,
        paypal_email: 'connected@paypal.com',
        payment_setup_complete: true
      }));
      
      toast.success('PayPal account linked successfully (Test Mode)');
    } catch (error) {
      toast.error('Failed to connect PayPal');
    }
  };

  const handleConnectStripe = async () => {
    if (!organizerId) return;
    
    // Simulate Stripe connection
    toast.info('Stripe connection simulated (Test Mode)');
    
    try {
      const { data: existing } = await supabase
        .from('organizer_payment_settings')
        .select('id')
        .eq('organizer_id', organizerId)
        .single();

      const updateData = {
        organizer_id: organizerId,
        stripe_connected: true,
        payment_setup_complete: true
      };

      if (existing) {
        await supabase
          .from('organizer_payment_settings')
          .update(updateData)
          .eq('organizer_id', organizerId);
      } else {
        await supabase
          .from('organizer_payment_settings')
          .insert(updateData);
      }

      setPaymentSettings(prev => ({
        ...prev,
        stripe_connected: true,
        payment_setup_complete: true
      }));
      
      toast.success('Stripe account connected successfully (Test Mode)');
    } catch (error) {
      toast.error('Failed to connect Stripe');
    }
  };

  const handleContinueToCreateEvent = () => {
    navigate('/create-event');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div 
        className="flex-1 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        
        <div className="relative container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Payment Setup</h1>
            <p className="text-muted-foreground">
              Configure your payment methods to receive payouts from ticket sales
            </p>
          </div>

          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-500">
              Payment integration is currently running in test mode. No real transactions will be processed until real API keys are added.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {/* MPESA Integration */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  MPESA Integration
                </CardTitle>
                <CardDescription>
                  Accept mobile money payments from your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortcode">Business Shortcode</Label>
                    <Input
                      id="shortcode"
                      placeholder="Enter shortcode (placeholder)"
                      value={paymentSettings.mpesa_shortcode}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        mpesa_shortcode: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">MPESA API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter API key (placeholder)"
                      value={paymentSettings.mpesa_api_key}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        mpesa_api_key: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiSecret">MPESA API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      placeholder="Enter API secret (placeholder)"
                      value={paymentSettings.mpesa_api_secret}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        mpesa_api_secret: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passkey">Passkey</Label>
                    <Input
                      id="passkey"
                      type="password"
                      placeholder="Enter passkey (placeholder)"
                      value={paymentSettings.mpesa_passkey}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        mpesa_passkey: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callback">Callback URL (Auto-generated)</Label>
                  <Input
                    id="callback"
                    value={paymentSettings.mpesa_callback_url}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <Button onClick={handleSaveMpesaSettings} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save MPESA Settings
                </Button>
              </CardContent>
            </Card>

            {/* Alternative Payment Methods */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  Alternative Payment Methods
                </CardTitle>
                <CardDescription>
                  Connect additional payment gateways
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant={paymentSettings.paypal_connected ? "default" : "outline"}
                    onClick={handleConnectPayPal}
                    className="flex items-center gap-2"
                  >
                    {paymentSettings.paypal_connected ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                    {paymentSettings.paypal_connected ? 'PayPal Connected' : 'Link PayPal Account'}
                  </Button>
                  
                  <Button 
                    variant={paymentSettings.stripe_connected ? "default" : "outline"}
                    onClick={handleConnectStripe}
                    className="flex items-center gap-2"
                  >
                    {paymentSettings.stripe_connected ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                    {paymentSettings.stripe_connected ? 'Stripe Connected' : 'Connect Stripe'}
                  </Button>
                </div>
                
                {(paymentSettings.paypal_connected || paymentSettings.stripe_connected) && (
                  <p className="text-sm text-muted-foreground">
                    Connected accounts are in test mode. Transactions will be simulated.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Commission Display */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Platform Commission
                </CardTitle>
                <CardDescription>
                  Transparent fee structure for ticket sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                        <th className="py-3 px-4 text-right font-medium">Rate/Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Platform Commission</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="secondary">10%</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Your Payout (per sale)</td>
                        <td className="py-3 px-4 text-right text-green-600 font-semibold">90%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Payment Gateway Fees</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">Included in commission</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Payout Schedule</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">3 days after event</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Example Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    If you sell a ticket for <strong>KES 1,000</strong>:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Platform Fee: KES 100 (10%)</li>
                    <li>• Your Payout: <span className="text-green-600 font-semibold">KES 900</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleContinueToCreateEvent}
                disabled={!paymentSettings.payment_setup_complete}
                className="min-w-[200px]"
              >
                {paymentSettings.payment_setup_complete ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Continue to Create Event
                  </>
                ) : (
                  'Complete Payment Setup First'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ImageSlider />
      <Footer />
    </div>
  );
};

export default OrganizerPaymentSetup;
