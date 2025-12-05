import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp,
  Activity,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  UserCheck,
  Percent,
  Wallet,
  Building
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
  totalCommission: number;
  recentPayments: any[];
  recentScans: any[];
  allUsers: any[];
  allEvents: any[];
  allOrders: any[];
  payouts: any[];
  organizers: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
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

      // Fetch all users for user management
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all events for event management
      const { data: allEvents } = await supabase
        .from('events')
        .select(`
          *,
          organizers (organization_name),
          categories (name)
        `)
        .order('created_at', { ascending: false });

      // Fetch all orders (payments with tickets)
      const { data: allOrders } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (full_name, phone_number),
          events (title, id)
        `)
        .order('created_at', { ascending: false });

      // Fetch payouts for commission tracking
      const { data: payouts } = await supabase
        .from('payouts')
        .select(`
          *,
          events (title),
          organizers (organization_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch organizers for payment verification
      const { data: organizers } = await supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });

      // Calculate commission (10% of total revenue)
      const totalCommission = totalRevenue * 0.1;

      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalTickets: ticketsCount || 0,
        totalRevenue,
        totalCommission,
        recentPayments: recentPayments || [],
        recentScans: recentScans || [],
        allUsers: allUsers || [],
        allEvents: allEvents || [],
        allOrders: allOrders || [],
        payouts: payouts || [],
        organizers: organizers || []
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

  const filteredUsers = stats?.allUsers.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredEvents = stats?.allEvents.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredOrders = stats?.allOrders.filter(order =>
    order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportToCSV = (data: any[], filename: string) => {
    toast({
      title: 'Export Started',
      description: `Exporting ${filename}...`
    });
    // In a real app, implement CSV export logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide analytics and monitoring</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => exportToCSV(filteredUsers, 'users.csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{user.id}</td>
                          <td className="px-6 py-4 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{user.phone_number || 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Management Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => exportToCSV(filteredEvents, 'events.csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export Events
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredEvents.map((event: any) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          {event.published ? (
                            <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>
                          ) : (
                            <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" /> Draft</Badge>
                          )}
                          {event.featured && <Badge>Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span><Calendar className="h-4 w-4 inline mr-1" />{new Date(event.event_date).toLocaleDateString()}</span>
                          <span>{event.location}</span>
                          <span className="text-muted-foreground">By {event.organizers?.organization_name}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => exportToCSV(filteredOrders, 'orders.csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export Orders
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{order.profiles?.full_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{order.profiles?.phone_number}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">{order.events?.title}</td>
                          <td className="px-6 py-4 font-semibold">KSh {Number(order.amount).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              order.payment_status === 'completed' ? 'default' :
                              order.payment_status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {order.payment_status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="border">
              <CardHeader>
                <CardTitle>System Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">New user registration</p>
                      <p className="text-sm text-muted-foreground">User registered successfully</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Payment processed</p>
                      <p className="text-sm text-muted-foreground">Order completed successfully</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Ticket scanned</p>
                      <p className="text-sm text-muted-foreground">Entry validated at venue</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission" className="space-y-6">
            {/* Commission Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                  <Percent className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    KES {stats?.totalCommission?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Platform earnings (10%)</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Organizer Payouts</CardTitle>
                  <Wallet className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    KES {((stats?.totalRevenue || 0) - (stats?.totalCommission || 0)).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Total paid to organizers</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
                  <Building className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.organizers?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered organizers</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    KES {stats?.payouts?.filter(p => p.payout_status === 'pending').reduce((sum, p) => sum + Number(p.organizer_payout), 0).toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting settlement</p>
                </CardContent>
              </Card>
            </div>

            {/* Commission by Event */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">Event</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Total Sales</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Platform Fee</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Organizer Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.allEvents?.slice(0, 10).map((event: any) => {
                        const eventRevenue = stats?.recentPayments
                          ?.filter((p: any) => p.events?.id === event.id)
                          ?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
                        const platformFee = eventRevenue * 0.1;
                        const organizerPayout = eventRevenue - platformFee;
                        
                        return (
                          <tr key={event.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{event.title}</td>
                            <td className="py-3 px-4 text-right">KES {eventRevenue.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-green-600">KES {platformFee.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-blue-600">KES {organizerPayout.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Payment Status */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organizer Payment Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">Organizer</th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground uppercase">Payment Setup</th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase">Total Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.organizers?.map((org: any) => (
                        <tr key={org.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{org.organization_name}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={org.verified ? "default" : "secondary"}>
                              {org.verified ? "Complete" : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {org.verified ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-amber-500 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">KES 0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;