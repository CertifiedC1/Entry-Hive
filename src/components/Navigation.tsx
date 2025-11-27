import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ticket, User, LogOut, ScanLine, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Ticket className="h-6 w-6" />
            <span>Tiko</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/my-tickets">
                  <Button variant="ghost">My Tickets</Button>
                </Link>
                <Link to="/organizer-dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link to="/ticket-scanner">
                  <Button variant="ghost">
                    <ScanLine className="h-4 w-4 mr-2" />
                    Scanner
                  </Button>
                </Link>
                <Link to="/admin-dashboard">
                  <Button variant="ghost">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
