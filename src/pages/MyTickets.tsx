import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from 'lucide-react';

const MyTickets = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              My Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your purchased tickets will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyTickets;
