import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, ShoppingCart, LayoutDashboard, Menu, X, Ticket } from 'lucide-react';
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
import { EntryHiveLogo } from './EntryHiveLogo';

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRoles();
    } else {
      setUserProfile(null);
      setUserRoles([]);
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = userRoles.includes('admin');
  const isOrganizer = userRoles.includes('organizer');
  const displayRole = isAdmin ? 'Admin' : isOrganizer ? 'Organizer' : 'User';

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
  ];

  // Golden nav link styles - black text with golden glow on hover
  const getNavLinkClass = (isActiveLink: boolean) => {
    const baseClass = "!text-foreground font-medium transition-all duration-300 hover:!text-primary hover:drop-shadow-[0_0_12px_hsl(43,74%,60%)]";
    return isActiveLink 
      ? `${baseClass} !text-primary drop-shadow-[0_0_10px_hsl(43,74%,60%)]` 
      : baseClass;
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <EntryHiveLogo size="md" />
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button 
                    variant="ghost" 
                    className={getNavLinkClass(isActive(link.path))}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {/* Dashboard link for organizers only */}
              {user && isOrganizer && (
                <Link to="/organizer-dashboard">
                  <Button 
                    variant="ghost"
                    className={getNavLinkClass(isActive('/organizer-dashboard'))}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center gap-2">
            {user && (
              <Link to="/my-tickets" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 hidden sm:flex">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userProfile?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{displayRole}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userProfile?.full_name || 'User'}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                      <Badge variant="secondary" className="mt-1 w-fit">{displayRole}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isOrganizer && (
                    <DropdownMenuItem asChild>
                      <Link to="/organizer-dashboard" className="w-full cursor-pointer text-primary">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer text-primary">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-tickets" className="w-full cursor-pointer text-primary">
                      <Ticket className="mr-2 h-4 w-4" />
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin-dashboard" className="w-full cursor-pointer text-primary">
                        Admin Panel
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

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${getNavLinkClass(isActive(link.path))}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {user && isOrganizer && (
                <Link to="/organizer-dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${getNavLinkClass(isActive('/organizer-dashboard'))}`}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              {user && (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className={`w-full justify-start ${getNavLinkClass(isActive('/profile'))}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/my-tickets" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className={`w-full justify-start ${getNavLinkClass(isActive('/my-tickets'))}`}>
                      <Ticket className="mr-2 h-4 w-4" />
                      My Tickets
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
