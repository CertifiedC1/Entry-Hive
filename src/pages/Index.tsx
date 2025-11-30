import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  venue: string;
  location: string;
  event_date: string;
  categories: {
    name: string;
    icon: string;
  } | null;
  ticket_types: Array<{
    price: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error('Failed to load categories');
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          categories (name, icon),
          ticket_types (price)
        `)
        .eq('published', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error('Failed to load events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Hero Section with Unsplash Background */}
      <section 
        className="relative overflow-hidden py-32 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')`
        }}
      >
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              Welcome
            </h1>
            <p className="mb-12 text-xl text-white/90">
              Discover and book tickets to amazing events
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-3xl">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search an event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 rounded-full bg-white pl-16 text-lg shadow-xl"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-card py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Popular Events</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No events found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  bannerUrl={event.banner_url || `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80`}
                  venue={event.venue}
                  location={event.location}
                  eventDate={event.event_date}
                  category={event.categories || undefined}
                  minPrice={
                    event.ticket_types.length > 0
                      ? Math.min(...event.ticket_types.map((t) => Number(t.price)))
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
