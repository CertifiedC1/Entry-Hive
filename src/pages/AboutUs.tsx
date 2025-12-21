import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { Users, Calendar, Ticket, TrendingUp, Shield, Zap, Globe, Heart, Target, Eye, CheckCircle } from 'lucide-react';

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
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl">🐝</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white">About EntryHive</h1>
          </div>
          <div className="max-w-3xl mx-auto text-white/90 text-center">
            <p className="text-lg md:text-xl leading-relaxed">
              EntryHive is a next-generation digital ticketing platform designed to simplify how events are created, 
              discovered, and experienced. Built for event organizers and attendees alike, EntryHive brings efficiency, 
              security, and innovation together in one powerful ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We believe ticketing should be <span className="text-primary font-semibold">fast</span>, 
            <span className="text-primary font-semibold"> secure</span>, and 
            <span className="text-primary font-semibold"> stress-free</span>. That's why EntryHive eliminates 
            the complexity often associated with event access—replacing long queues, paper tickets, and 
            unreliable systems with smart, digital-first solutions.
          </p>
          <p className="mt-6 text-lg text-muted-foreground">
            Whether it's a concert, conference, sports event, church gathering, school function, or community meetup, 
            EntryHive ensures that every entry is smooth and every experience begins on the right note.
          </p>
        </div>
      </section>

      {/* 2025 at a Glance */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">2025 at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-card border">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">Events in slightly over year</p>
              <p className="text-4xl font-bold text-primary">2</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">Active Users</p>
              <p className="text-4xl font-bold text-primary">15K</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">Total Tickets Sold</p>
              <p className="text-4xl font-bold text-primary">50K+</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🚀 What We Offer</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            At EntryHive, we provide a complete ticketing solution that supports events of all sizes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-card border hover:border-primary transition-colors">
              <Ticket className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Digital Ticket Sales</h3>
              <p className="text-muted-foreground text-sm">Sell tickets online with ease and reach your audience instantly.</p>
            </div>
            <div className="p-6 rounded-xl bg-card border hover:border-primary transition-colors">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure QR Code Entry</h3>
              <p className="text-muted-foreground text-sm">Fast, fraud-resistant ticket validation at the gate.</p>
            </div>
            <div className="p-6 rounded-xl bg-card border hover:border-primary transition-colors">
              <TrendingUp className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-Time Management</h3>
              <p className="text-muted-foreground text-sm">Monitor sales, attendance, and check-ins live.</p>
            </div>
            <div className="p-6 rounded-xl bg-card border hover:border-primary transition-colors">
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Multiple Event Types</h3>
              <p className="text-muted-foreground text-sm">From music and sports to education, faith-based, and corporate events.</p>
            </div>
            <div className="p-6 rounded-xl bg-card border hover:border-primary transition-colors">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Mobile-Friendly Experience</h3>
              <p className="text-muted-foreground text-sm">Buy, store, and scan tickets on any device.</p>
            </div>
            <div className="p-6 rounded-xl bg-card border hover:border-primary transition-colors">
              <CheckCircle className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Reliable Payments</h3>
              <p className="text-muted-foreground text-sm">Safe and seamless payment processing you can trust.</p>
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
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">75+</p>
              <p className="text-sm md:text-base text-muted-foreground">Successful Events</p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">12K+</p>
              <p className="text-sm md:text-base text-muted-foreground">Happy Clients</p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">50K+</p>
              <p className="text-sm md:text-base text-muted-foreground">Tickets Sold</p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card border">
              <p className="text-3xl md:text-5xl font-bold text-primary mb-2">15K+</p>
              <p className="text-sm md:text-base text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose EntryHive */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🌍 Why Choose EntryHive?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            What sets EntryHive apart is our commitment to simplicity, reliability, and growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-4">
              <Globe className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Built for Africa & Beyond</h3>
                <p className="text-sm text-muted-foreground">Optimized for local and global audiences.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Scalable Technology</h3>
                <p className="text-sm text-muted-foreground">Works just as well for small gatherings as it does for large events.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Security First</h3>
                <p className="text-sm text-muted-foreground">Advanced systems to protect tickets, payments, and user data.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">User-Centered Design</h3>
                <p className="text-sm text-muted-foreground">Clean, intuitive interfaces for both organizers and attendees.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Always Evolving</h3>
                <p className="text-sm text-muted-foreground">Constantly improving to meet modern event demands.</p>
              </div>
            </div>
          </div>
          <p className="text-center text-lg text-muted-foreground mt-8 max-w-2xl mx-auto">
            EntryHive is not just a ticketing platform — it's a <span className="text-primary font-semibold">digital gateway</span> that connects people to experiences they care about.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-xl bg-card border">
              <Target className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">🎯 Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To empower event organizers with smart tools and give attendees a seamless, 
                trustworthy way to access events—making every entry count.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-card border">
              <Eye className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">🌟 Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the most trusted and innovative ticketing platform, 
                redefining how people access events in a connected world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">🐝 EntryHive Stands For</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <span className="px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold">Efficiency</span>
            <span className="px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold">Community</span>
            <span className="px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold">Trust</span>
            <span className="px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold">Innovation</span>
          </div>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Just like a hive, everything works together smoothly—creating value for everyone involved.
          </p>
        </div>
      </section>

      {/* Image Slider */}
      <ImageSlider />

      <Footer />
    </div>
  );
};

export default AboutUs;
