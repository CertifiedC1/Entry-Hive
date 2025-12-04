import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    subject: '',
    question: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message Sent!',
      description: 'We\'ll get back to you as soon as possible.',
    });
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: '',
      subject: '',
      question: ''
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <div 
        className="relative py-16 md:py-20 px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="container mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        </div>
      </div>

      <section className="py-12 md:py-16 px-4 flex-1">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                Contact us about anything related to Ticketyetu events or services.<br />
                We'll do our best to get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Your Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Your Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    rows={5}
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto px-12">
                  Submit
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Ticket Yetu</h2>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Address</p>
                      <p className="text-muted-foreground text-sm md:text-base">3rd Floor, Lion Place, Westlands</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Phone</p>
                      <p className="text-muted-foreground text-sm md:text-base">+254 793 333 888</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      <p className="text-muted-foreground text-sm md:text-base">support@ticketyetu.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div 
                className="w-full h-48 md:h-64 rounded-lg bg-muted"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <ImageSlider />
      <Footer />
    </div>
  );
};

export default ContactUs;