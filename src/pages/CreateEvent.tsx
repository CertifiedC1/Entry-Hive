import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Upload, Image, X, Search, Globe } from 'lucide-react';

interface TicketType {
  name: string;
  description: string;
  price: number;
  quantity_available: number;
}

// Curated Unsplash event images for quick selection
const UNSPLASH_EVENT_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', label: 'Conference' },
  { url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', label: 'Concert' },
  { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', label: 'Party' },
  { url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80', label: 'Festival' },
  { url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', label: 'Stage' },
  { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', label: 'Crowd' },
  { url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80', label: 'Music' },
  { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', label: 'Wedding' },
  { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80', label: 'Sports' },
  { url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80', label: 'Speaker' },
  { url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80', label: 'Exhibition' },
  { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', label: 'Outdoor' },
];

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [selectedUnsplashUrl, setSelectedUnsplashUrl] = useState<string | null>(null);
  const [bannerSource, setBannerSource] = useState<'upload' | 'unsplash'>('upload');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: 'General', description: '', price: 0, quantity_available: 100 },
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkOrganizer();
    fetchCategories();
  }, [user]);

  const checkOrganizer = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('organizers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      toast.error('Please create an organizer profile first');
      navigate('/create-organizer');
      return;
    }

    // Check if payment setup is complete
    const { data: paymentSettings } = await supabase
      .from('organizer_payment_settings')
      .select('payment_setup_complete')
      .eq('organizer_id', data.id)
      .single();

    if (!paymentSettings?.payment_setup_complete) {
      toast.info('Please complete payment setup before creating an event');
      navigate('/organizer/payment-setup');
      return;
    }

    setOrganizerId(data.id);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setBannerFile(file);
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setSelectedUnsplashUrl(null);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectUnsplashImage = (url: string) => {
    setSelectedUnsplashUrl(url);
    setBannerPreview(url);
    setBannerFile(null);
    setBannerSource('unsplash');
  };

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `event-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, bannerFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: '', description: '', price: 0, quantity_available: 100 },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!organizerId) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      // Get banner URL - either from upload or Unsplash
      let bannerUrl: string | null = null;
      if (bannerFile) {
        bannerUrl = await uploadBanner();
      } else if (selectedUnsplashUrl) {
        bannerUrl = selectedUnsplashUrl;
      }

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: organizerId,
          title: formData.get('title') as string,
          slug,
          description: formData.get('description') as string,
          venue: formData.get('venue') as string,
          location: formData.get('location') as string,
          event_date: formData.get('event_date') as string,
          end_date: formData.get('end_date') as string,
          category_id: formData.get('category_id') as string,
          total_capacity: parseInt(formData.get('total_capacity') as string),
          banner_url: bannerUrl,
          published: false,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create ticket types
      const ticketTypesData = ticketTypes.map((tt) => ({
        event_id: event.id,
        name: tt.name,
        description: tt.description,
        price: tt.price,
        quantity_available: tt.quantity_available,
      }));

      const { error: ticketError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesData);

      if (ticketError) throw ticketError;

      toast.success('Event created successfully!');
      navigate('/organizer-dashboard');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!organizerId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navigation />
      
      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8 flex-1">
        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl lg:text-3xl">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Banner Upload */}
              <div className="space-y-4">
                <Label>Event Banner Image</Label>
                
                <Tabs value={bannerSource} onValueChange={(v) => setBannerSource(v as 'upload' | 'unsplash')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </TabsTrigger>
                    <TabsTrigger value="unsplash" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Use Unsplash
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {bannerPreview && bannerSource === 'upload' ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={bannerPreview}
                          alt="Event banner preview"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeBanner}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center p-4">
                          <Upload className="h-8 w-8 md:h-10 md:w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground font-medium">
                            Click to upload banner image
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                    )}

                    {!bannerPreview && bannerSource === 'upload' && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full md:w-auto"
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="unsplash" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Select a professional event image from Unsplash
                    </p>
                    
                    {selectedUnsplashUrl && bannerSource === 'unsplash' && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted mb-4">
                        <img
                          src={selectedUnsplashUrl}
                          alt="Selected Unsplash image"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeBanner}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          ✓ Selected
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {UNSPLASH_EVENT_IMAGES.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectUnsplashImage(img.url)}
                          className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all hover:border-primary ${
                            selectedUnsplashUrl === img.url ? 'border-primary ring-2 ring-primary/50' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                            {img.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="Amazing Concert 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select name="category_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    name="venue"
                    required
                    placeholder="Kasarani Stadium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    required
                    placeholder="Nairobi, Kenya"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_date">Start Date & Time *</Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="datetime-local"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_capacity">Total Capacity</Label>
                  <Input
                    id="total_capacity"
                    name="total_capacity"
                    type="number"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  placeholder="Describe your event..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label className="text-base md:text-lg font-semibold">Ticket Types</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTicketType}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ticket Type
                  </Button>
                </div>

                {ticketTypes.map((ticket, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Ticket Type #{index + 1}</h4>
                          {ticketTypes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTicketType(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                              value={ticket.name}
                              onChange={(e) =>
                                updateTicketType(index, 'name', e.target.value)
                              }
                              required
                              placeholder="VIP, General, Early Bird"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Price (KES) *</Label>
                            <Input
                              type="number"
                              value={ticket.price}
                              onChange={(e) =>
                                updateTicketType(index, 'price', parseFloat(e.target.value))
                              }
                              required
                              min="0"
                              step="1"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={ticket.quantity_available}
                              onChange={(e) =>
                                updateTicketType(
                                  index,
                                  'quantity_available',
                                  parseInt(e.target.value)
                                )
                              }
                              required
                              min="1"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              value={ticket.description}
                              onChange={(e) =>
                                updateTicketType(index, 'description', e.target.value)
                              }
                              placeholder="Optional description"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/organizer-dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading || uploading}>
                  {loading || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? 'Uploading...' : 'Creating...'}
                    </>
                  ) : (
                    'Create Event'
                  )}
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

export default CreateEvent;