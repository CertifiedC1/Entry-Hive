import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Loader2,
  Calendar,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PayoutStats {
  totalSales: number;
  pendingPayouts: number;
  completedPayouts: number;
  platformFees: number;
}

interface Payout {
  id: string;
  total_amount: number;
  platform_fee: number;
  organizer_payout: number;
  payout_status: string;
  transaction_id: string;
  created_at: string;
  processed_at: string | null;
  events?: { title: string };
}

const OrganizerPayouts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PayoutStats>({
    totalSales: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    platformFees: 0
  });
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPayoutData();
  }, [user]);

  const fetchPayoutData = async () => {
    try {
      // Get organizer ID
      const { data: organizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!organizer) {
        navigate('/create-organizer');
        return;
      }

      // Fetch payouts
      const { data: payoutsData } = await supabase
        .from('payouts')
        .select(`
          *,
          events (title)
        `)
        .eq('organizer_id', organizer.id)
        .order('created_at', { ascending: false });

      if (payoutsData) {
        setPayouts(payoutsData);
        
        // Calculate stats
        const totalSales = payoutsData.reduce((sum, p) => sum + Number(p.total_amount), 0);
        const pendingPayouts = payoutsData
          .filter(p => p.payout_status === 'pending')
          .reduce((sum, p) => sum + Number(p.organizer_payout), 0);
        const completedPayouts = payoutsData
          .filter(p => p.payout_status === 'completed')
          .reduce((sum, p) => sum + Number(p.organizer_payout), 0);
        const platformFees = payoutsData.reduce((sum, p) => sum + Number(p.platform_fee), 0);

        setStats({
          totalSales,
          pendingPayouts,
          completedPayouts,
          platformFees
        });
      }
    } catch (error) {
      console.error('Error fetching payout data:', error);
    } finally {
      setLoading(false);
    }
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
          backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Payout Dashboard</h1>
            <p className="text-muted-foreground">
              Track your earnings and payment settlements
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {stats.totalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All-time ticket sales</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">KES {stats.pendingPayouts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Awaiting settlement</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">KES {stats.completedPayouts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Successfully paid out</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {stats.platformFees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total fees collected</p>
              </CardContent>
            </Card>
          </div>

          {/* Settlement Schedule */}
          <Card className="mb-8 border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Settlement Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Payout Schedule:</strong> Payouts are processed automatically 3 days after each event ends.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Note: Currently in test mode. All settlements are simulated until real payment gateway keys are configured.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payout Table */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Detailed breakdown of all your payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payout transactions yet</p>
                  <p className="text-sm">Payouts will appear here after ticket sales</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">Event</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Ticket Price</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Platform Fee</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Net Payout</th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(payout.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {payout.events?.title || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            KES {Number(payout.total_amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                            KES {Number(payout.platform_fee).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                            KES {Number(payout.organizer_payout).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant={payout.payout_status === 'completed' ? 'default' : 'secondary'}
                              className={payout.payout_status === 'completed' ? 'bg-green-500' : ''}
                            >
                              {payout.payout_status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                            {payout.transaction_id || 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ImageSlider />
      <Footer />
    </div>
  );
};

export default OrganizerPayouts;
