import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'entryhive_attendee_state';

interface AttendeeState {
  eventId: string;
  selectedTickets: Record<string, number>;
  totalAmount: number;
  ticketDetails?: Record<string, { name: string; price: number }>;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  eventLocation?: string;
}

const AttendeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [stateData, setStateData] = useState<AttendeeState | null>(null);

  // Load state from location.state or sessionStorage
  useEffect(() => {
    const locState = location.state as AttendeeState | undefined;
    if (locState?.eventId && locState?.selectedTickets) {
      // Save to sessionStorage for refresh safety
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(locState));
      setStateData(locState);
    } else {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AttendeeState;
          if (parsed.eventId && parsed.selectedTickets) {
            setStateData(parsed);
            return;
          }
        } catch (e) {
          console.error('Failed to parse stored attendee state:', e);
        }
      }
      // No valid state - redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (!stateData) {
      toast.error('Session expired. Please start again.');
      navigate('/');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const attendeeInfo = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    // Navigate to checkout with attendee info
    navigate('/checkout', {
      state: {
        ...stateData,
        attendeeInfo,
      },
    });
  };

  if (!stateData) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navigation />
      
      <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12 flex-1">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6 text-white hover:text-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl">Attendees</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Your tickets will automatically be sent to you and your guests. You will simply need to fill in their Name, Email address and phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-base md:text-lg">Ticket #1 - Advance</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Full Name"
                      required
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="07XXXXXXXX"
                    required
                    pattern="[0-9]{10,}"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  By ticking this box, I agree that I have read, understood and agreed to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!acceptedTerms}
                >
                  Get Ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ImageSlider />
      <Footer />
    </div>
  );
};

export default AttendeeDetails;
