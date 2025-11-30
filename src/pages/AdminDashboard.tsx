import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  recentPayments: any[];
  recentScans: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roles) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchDashboardStats();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch total tickets
      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      // Fetch total revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'completed');

      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_status,
          created_at,
          payment_method,
          user_id,
          profiles:user_id (full_name),
          events (title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent scans
      const { data: recentScans } = await supabase
        .from('scans')
        .select(`
          id,
          scanned_at,
          location,
          tickets (
            ticket_number,
            attendee_name,
            events (title)
          )
        `)
        .order('scanned_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalTickets: ticketsCount || 0,
        totalRevenue,
        recentPayments: recentPayments || [],
        recentScans: recentScans || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide analytics and monitoring</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">Published events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">KSh {stats?.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentPayments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No payments yet</p>
                ) : (
                  stats?.recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{payment.events?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KSh {Number(payment.amount).toLocaleString()}</p>
                        <p className={`text-xs ${
                          payment.payment_status === 'completed' ? 'text-green-500' : 'text-amber-500'
                        }`}>
                          {payment.payment_status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Ticket Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentScans.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No scans yet</p>
                ) : (
                  stats?.recentScans.map((scan: any) => (
                    <div key={scan.id} className="pb-4 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{scan.tickets?.events?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {scan.tickets?.attendee_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ticket: {scan.tickets?.ticket_number}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {new Date(scan.scanned_at).toLocaleString()}
                        </div>
                      </div>
                      {scan.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Location: {scan.location}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;