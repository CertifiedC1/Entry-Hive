import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Users, Calendar, Ticket, TrendingUp } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <div 
        className="relative py-20 px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="container mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">Create A Lifestyle & Build Brand Legacies</h1>
          <div className="max-w-3xl mx-auto text-white/90 space-y-2">
            <p>• Create a social brand in ground community around our events</p>
            <p>• Our goal is to ensure YOUR brand becomes a must go to event in the City Calendar</p>
            <p>• Sell higher increments of brand experience for all our events</p>
            <p>• Create strategic partnerships with the Counties, Airline, Hotels, Universities and Outdoor Venues</p>
          </div>
        </div>
      </div>

      {/* 2025 at a Glance */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">2025 at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">Events in slightly over year</p>
              <p className="text-4xl font-bold">60</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">Active Users</p>
              <p className="text-4xl font-bold">50K</p>
            </div>
            <div className="text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">Total Tickets Sold</p>
              <p className="text-4xl font-bold">100M+</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Our Success */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">About Our Success</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">120+</p>
              <p className="text-sm md:text-base text-muted-foreground">Successful Events</p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">200+</p>
              <p className="text-sm md:text-base text-muted-foreground">Happy Clients</p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">50K+</p>
              <p className="text-sm md:text-base text-muted-foreground">Tickets Sold</p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">20K+</p>
              <p className="text-sm md:text-base text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Who We Are</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ticketyetu is a game changer in how we engage with our audience, consume experiences, 
                and share content by connecting consumers, personalities, and brands through LIVE experiences. 
                We get to understand the brand goals, ideate, conceptualize, and execute.
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Our Offering</h3>
              <p className="text-muted-foreground leading-relaxed">
                We redefine Events and Experiential marketing in Kenya by creating relevant and impactful 
                brand experiences for brands and their target audience. Our Values: R.A.G.E - Reliability - 
                Authenticity - Grit - Excellence
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                From idea to conceptualization and implementation, we deliver solutions and brand experiences 
                that give brands the freedom to speak louder, scale faster, and grow stronger by integrating 
                an omnichannel approach, capacitated with Radio, TV, Social Media, Influencers, talent, and 
                technologies. We amplify and extend reach and impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Slider */}
      <ImageSlider />

      <Footer />
    </div>
  );
};

export default AboutUs;
