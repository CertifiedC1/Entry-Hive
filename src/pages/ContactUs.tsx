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
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(formData.name);
    const isPhoneValid = validatePhone(formData.phone);
    
    if (!isNameValid || !isPhoneValid) {
      return;
    }
    
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
    setNameError('');
    setPhoneError('');
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
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Contact EntryHive</h1>
          <p className="text-white/80 max-w-xl">
            Have questions about our platform? We're here to help you make every event a success.
          </p>
        </div>
      </div>

      <section className="py-12 md:py-16 px-4 flex-1">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                Contact us about anything related to EntryHive events or services.<br />
                We'll do our best to get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter your full name (2-4 names)"
                    className={`mt-1 ${nameError ? 'border-destructive' : ''}`}
                  />
                  {nameError && (
                    <p className="text-sm text-destructive mt-1">{nameError}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    maxLength={13}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter your phone number"
                    className={`mt-1 ${phoneError ? 'border-destructive' : ''}`}
                  />
                  {phoneError && (
                    <p className="text-sm text-destructive mt-1">{phoneError}</p>
                  )}
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
                  <Label htmlFor="question">Your Message</Label>
                  <Textarea
                    id="question"
                    rows={5}
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full md:w-auto px-12"
                  disabled={!!nameError || !!phoneError}
                >
                  Submit
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">EntryHive</h2>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Address</p>
                      <p className="text-muted-foreground text-sm md:text-base">Nairobi, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Phone</p>
                      <a href="tel:+254711653881" className="text-primary hover:underline text-sm md:text-base">
                        +254 711 653 881
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      <a href="mailto:support@entryhive.gmail.com" className="text-primary hover:underline text-sm md:text-base">
                        support@entryhive.gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nairobi image */}
              <div 
                className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="w-full h-full bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                  <p className="text-white font-semibold">Nairobi, Kenya 🇰🇪</p>
                </div>
              </div>
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
