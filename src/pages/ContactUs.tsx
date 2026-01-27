import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from '@/lib/rate-limiter';
import contactImage from '@/assets/contact-ticketing.jpg';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    subject: '',
    question: ''
  });
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Validate name: 2-4 words, only letters and spaces
  const validateName = (name: string): boolean => {
    const trimmed = name.trim();
    const letterOnlyRegex = /^[a-zA-Z\s]+$/;
    
    if (!letterOnlyRegex.test(trimmed)) {
      setNameError('Invalid name format. Only letters are allowed.');
      return false;
    }
    
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2 || words.length > 4) {
      setNameError('Name must contain 2 to 4 names.');
      return false;
    }

    const hasShortWord = words.some(w => w.length < 2);
    if (hasShortWord) {
      setNameError('Each name must be at least 2 characters.');
      return false;
    }
    
    setNameError('');
    return true;
  };

  // Validate phone: only numbers, max 13 characters, required
  const validatePhone = (phone: string): boolean => {
    const trimmed = phone.trim();
    
    if (!trimmed) {
      setPhoneError('Phone number is required.');
      return false;
    }
    
    const numberOnlyRegex = /^[0-9+]+$/;
    
    if (!numberOnlyRegex.test(trimmed)) {
      setPhoneError('Invalid number format. Only numbers are allowed.');
      return false;
    }
    
    if (trimmed.length > 13) {
      setPhoneError('Invalid number format. Maximum 13 characters.');
      return false;
    }
    
    if (trimmed.length < 10) {
      setPhoneError('Phone number must be at least 10 digits.');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({...formData, name: value});
    if (value) validateName(value);
    else setNameError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({...formData, phone: value});
    if (value) validatePhone(value);
    else setPhoneError('Phone number is required.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(formData.name);
    const isPhoneValid = validatePhone(formData.phone);
    
    if (!isNameValid || !isPhoneValid) {
      return;
    }

    // Rate limiting check
    const rateCheck = checkRateLimit('contact');
    if (!rateCheck.allowed) {
      toast({
        title: 'Too Many Requests',
        description: `Please wait ${rateCheck.retryAfter} seconds before sending another message.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the edge function to send email (bypasses CORS)
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          subject: formData.subject,
          message: formData.question,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: 'Message Sent Successfully!',
          description: 'Thank you for contacting us. We\'ll get back to you soon.',
        });
        setFormData({
          name: '',
          phone: '',
          email: '',
          company: '',
          subject: '',
          question: ''
        });
        setNameError('');
        setPhoneError('');
      } else {
        throw new Error(data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: 'Failed to Send Message',
        description: 'Please try again later or contact us directly via phone.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <div 
        className="relative py-16 md:py-20 px-4"
        style={{
          backgroundImage: `url(${contactImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="container mx-auto relative z-10">
          <ScrollReveal animation="fade-up">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-gold">Contact</span>{' '}
              <span className="text-white">EntryHive</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-white/80 max-w-xl">
              Have questions about our platform? We're here to help you make every event a success.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-12 md:py-16 px-4 flex-1">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <ScrollReveal animation="fade-right">
              <div>
                <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                  Contact us about anything related to EntryHive events or services.<br />
                  We'll do our best to get back to you as soon as possible.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="group">
                    <Label htmlFor="name" className="group-focus-within:text-primary transition-colors">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Enter your full name (2-4 names)"
                      className={`mt-1 transition-all duration-300 focus:scale-[1.01] ${nameError ? 'border-destructive' : ''}`}
                    />
                    {nameError && (
                      <p className="text-sm text-destructive mt-1 animate-fade-in">{nameError}</p>
                    )}
                  </div>

                  <div className="group">
                    <Label htmlFor="phone" className="group-focus-within:text-primary transition-colors">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      maxLength={13}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter your phone number"
                      className={`mt-1 transition-all duration-300 focus:scale-[1.01] ${phoneError ? 'border-destructive' : ''}`}
                    />
                    {phoneError && (
                      <p className="text-sm text-destructive mt-1 animate-fade-in">{phoneError}</p>
                    )}
                  </div>

                  <div className="group">
                    <Label htmlFor="email" className="group-focus-within:text-primary transition-colors">Your Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 transition-all duration-300 focus:scale-[1.01]"
                    />
                  </div>

                  <div className="group">
                    <Label htmlFor="company" className="group-focus-within:text-primary transition-colors">Your Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="mt-1 transition-all duration-300 focus:scale-[1.01]"
                    />
                  </div>

                  <div className="group">
                    <Label htmlFor="subject" className="group-focus-within:text-primary transition-colors">Subject *</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="mt-1 transition-all duration-300 focus:scale-[1.01]"
                    />
                  </div>

                  <div className="group">
                    <Label htmlFor="question" className="group-focus-within:text-primary transition-colors">Your Message</Label>
                    <Textarea
                      id="question"
                      rows={5}
                      value={formData.question}
                      onChange={(e) => setFormData({...formData, question: e.target.value})}
                      className="mt-1 transition-all duration-300 focus:scale-[1.01]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto px-12 hover-lift click-shrink hover-glow"
                    disabled={!!nameError || !!phoneError || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </ScrollReveal>

            {/* Contact Info */}
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gradient-gold">EntryHive</h2>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-default group">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold mb-1">Address</p>
                        <p className="text-muted-foreground text-sm md:text-base">Nairobi, Kenya</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-default group">
                      <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold mb-1">Phone</p>
                        <a href="tel:+254711653881" className="text-primary hover:underline text-sm md:text-base link-underline">
                          +254 711 653 881
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-default group">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold mb-1">Email</p>
                        <a href="mailto:support@entryhive.com" className="text-primary hover:underline text-sm md:text-base link-underline">
                          support@entryhive.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticketing image */}
                <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg card-interactive">
                  <img 
                    src={contactImage} 
                    alt="Digital ticketing experience" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <ImageSlider />
      <Footer />
    </div>
  );
};

export default ContactUs;
