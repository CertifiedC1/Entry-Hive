import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ticket, User, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setUserProfile(data);
  };

  const fetchUserRoles = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    if (data) {
      setUserRoles(data.map(r => r.role));
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = userRoles.includes('admin');
  const isOrganizer = userRoles.includes('organizer');
  const displayRole = isAdmin ? 'Admin' : isOrganizer ? 'Organizer' : 'User';

  return (
    <nav className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Ticket className="h-6 w-6" />
            <span>Tiko</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/">
              <Button 
                variant="ghost" 
                className={isActive('/') ? 'text-primary' : ''}
              >
                Home
              </Button>
            </Link>
            <Link to="/">
              <Button 
                variant="ghost"
                className={isActive('/events') ? 'text-primary' : ''}
              >
                Events
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost">About Us</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost">Contact Us</Button>
            </Link>
            
            {user && (
              <Link to="/my-tickets" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    0
                  </Badge>
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userProfile?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{displayRole}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-tickets" className="w-full cursor-pointer">
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                  {isOrganizer && (
                    <DropdownMenuItem asChild>
                      <Link to="/organizer-dashboard" className="w-full cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin-dashboard" className="w-full cursor-pointer">
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
