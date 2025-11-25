import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CreateOrganizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const organizerData = {
      user_id: user.id,
      organization_name: formData.get('organizationName') as string,
      description: formData.get('description') as string,
      contact_email: formData.get('contactEmail') as string,
      contact_phone: formData.get('contactPhone') as string,
      website_url: formData.get('websiteUrl') as string,
    };

    try {
      const { error } = await supabase.from('organizers').insert(organizerData);

      if (error) throw error;

      toast.success('Organizer profile created successfully!');
      navigate('/organizer-dashboard');
    } catch (error: any) {
      console.error('Error creating organizer:', error);
      toast.error(error.message || 'Failed to create organizer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Organizer Profile</CardTitle>
            <CardDescription>
              Set up your organization profile to start creating events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  required
                  placeholder="Your Company or Organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Tell us about your organization..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  placeholder="contact@organization.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="254712345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organizer Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrganizer;
