import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  CheckCircle, 
  Loader2,
  Percent,
  User,
  Phone
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
    full_name: '',
    mpesa_phone: '',
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
      
      // Check for existing payment settings
      const { data: settings } = await supabase
        .from('organizer_payment_settings')
        .select('*')
        .eq('organizer_id', organizer.id)
        .single();

      if (settings) {
        setPaymentSettings({
          full_name: settings.mpesa_shortcode || '', // Repurposing field for full name
          mpesa_phone: settings.mpesa_api_key || '', // Repurposing field for phone
          payment_setup_complete: settings.payment_setup_complete || false
        });
      }
    } catch (error) {
      console.error('Error checking organizer status:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSavePaymentSettings = async () => {
    if (!organizerId) return;

    if (!paymentSettings.full_name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!paymentSettings.mpesa_phone.trim()) {
      toast.error('Please enter your MPESA phone number');
      return;
    }

    if (!validatePhone(paymentSettings.mpesa_phone)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }
    
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('organizer_payment_settings')
        .select('id')
        .eq('organizer_id', organizerId)
        .single();

      const settingsData = {
        organizer_id: organizerId,
        mpesa_shortcode: paymentSettings.full_name, // Store full name
        mpesa_api_key: paymentSettings.mpesa_phone, // Store phone number
        payment_setup_complete: true
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

      toast.success('Payment settings saved successfully');
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
            <h1 className="text-4xl font-bold mb-2 text-gradient-gold">Payment Setup</h1>
            <p className="text-muted-foreground">
              Configure your payment details to receive payouts from ticket sales
            </p>
          </div>

          <div className="grid gap-6">
            {/* MPESA Payout Details */}
            <Card className="border card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  MPESA Payout Details
                </CardTitle>
                <CardDescription>
                  Enter your details for receiving payouts via MPESA (3 days after event)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name as registered on MPESA"
                      value={paymentSettings.full_name}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        full_name: e.target.value
                      }))}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mpesaPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      MPESA Phone Number
                    </Label>
                    <Input
                      id="mpesaPhone"
                      type="tel"
                      placeholder="e.g., 0712345678 or +254712345678"
                      value={paymentSettings.mpesa_phone}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        mpesa_phone: e.target.value
                      }))}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      This number will be used to send your earnings after each event
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleSavePaymentSettings} 
                  disabled={saving}
                  className="hover-lift"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Payment Details
                </Button>
              </CardContent>
            </Card>

            {/* Commission Display */}
            <Card className="border card-interactive">
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
                      <tr className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">Platform Commission</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="secondary">10%</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">Your Payout (per sale)</td>
                        <td className="py-3 px-4 text-right text-green-600 font-semibold">90%</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">Payment Gateway Fees</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">Included in commission</td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
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
                className="min-w-[200px] hover-lift"
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
