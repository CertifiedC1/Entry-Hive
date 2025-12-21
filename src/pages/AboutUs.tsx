import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ImageSlider } from '@/components/ImageSlider';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { InteractiveText } from '@/components/InteractiveText';
import { Users, Calendar, Ticket, TrendingUp, Shield, Zap, Globe, Heart, Target, Eye, CheckCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

// Animated counter component
const AnimatedCounter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const duration = 2000;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(end * easeOut));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, hasStarted]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

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
          <ScrollReveal animation="fade-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-5xl animate-bounce">🐝</span>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                About <InteractiveText text="EntryHive" className="text-primary" />
              </h1>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="max-w-3xl mx-auto text-white/90 text-center">
              <p className="text-lg md:text-xl leading-relaxed">
                EntryHive is a next-generation digital ticketing platform designed to simplify how events are created, 
                discovered, and experienced. Built for event organizers and attendees alike, EntryHive brings efficiency, 
                security, and innovation together in one powerful ecosystem.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal animation="fade-up">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We believe ticketing should be <span className="text-primary font-semibold">fast</span>, 
              <span className="text-primary font-semibold"> secure</span>, and 
              <span className="text-primary font-semibold"> stress-free</span>. That's why EntryHive eliminates 
              the complexity often associated with event access—replacing long queues, paper tickets, and 
              unreliable systems with smart, digital-first solutions.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={150}>
            <p className="mt-6 text-lg text-muted-foreground">
              Whether it's a concert, conference, sports event, church gathering, school function, or community meetup, 
              EntryHive ensures that every entry is smooth and every experience begins on the right note.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 2025 at a Glance */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <InteractiveText text="2025 at a Glance" />
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ScrollReveal animation="scale" delay={0}>
              <div className="text-center p-6 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:scale-105">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground mb-2">Events in slightly over year</p>
                <p className="text-4xl font-bold text-primary"><AnimatedCounter end={2} /></p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="scale" delay={150}>
              <div className="text-center p-6 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:scale-105">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground mb-2">Active Users</p>
                <p className="text-4xl font-bold text-primary"><AnimatedCounter end={15} suffix="K" /></p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="scale" delay={300}>
              <div className="text-center p-6 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:scale-105">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground mb-2">Total Tickets Sold</p>
                <p className="text-4xl font-bold text-primary"><AnimatedCounter end={50} suffix="K+" /></p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🚀 What We Offer</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              At EntryHive, we provide a complete ticketing solution that supports events of all sizes
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Ticket, title: 'Digital Ticket Sales', desc: 'Sell tickets online with ease and reach your audience instantly.' },
              { icon: Shield, title: 'Secure QR Code Entry', desc: 'Fast, fraud-resistant ticket validation at the gate.' },
              { icon: TrendingUp, title: 'Real-Time Management', desc: 'Monitor sales, attendance, and check-ins live.' },
              { icon: Calendar, title: 'Multiple Event Types', desc: 'From music and sports to education, faith-based, and corporate events.' },
              { icon: Zap, title: 'Mobile-Friendly Experience', desc: 'Buy, store, and scan tickets on any device.' },
              { icon: CheckCircle, title: 'Reliable Payments', desc: 'Safe and seamless payment processing you can trust.' },
            ].map((item, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <div className="p-6 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <item.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About Our Success */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <InteractiveText text="About Our Success" />
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: 75, suffix: '+', label: 'Successful Events' },
              { value: 12, suffix: 'K+', label: 'Happy Clients' },
              { value: 50, suffix: 'K+', label: 'Tickets Sold' },
              { value: 15, suffix: 'K+', label: 'Active Users' },
            ].map((stat, index) => (
              <ScrollReveal key={index} animation="scale" delay={index * 100}>
                <div className="text-center p-4 md:p-6 rounded-lg bg-card border hover:border-primary transition-all duration-300 hover:scale-105">
                  <p className="text-3xl md:text-5xl font-bold text-primary mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose EntryHive */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🌍 Why Choose EntryHive?</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              What sets EntryHive apart is our commitment to simplicity, reliability, and growth.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Globe, title: 'Built for Africa & Beyond', desc: 'Optimized for local and global audiences.' },
              { icon: TrendingUp, title: 'Scalable Technology', desc: 'Works just as well for small gatherings as it does for large events.' },
              { icon: Shield, title: 'Security First', desc: 'Advanced systems to protect tickets, payments, and user data.' },
              { icon: Heart, title: 'User-Centered Design', desc: 'Clean, intuitive interfaces for both organizers and attendees.' },
              { icon: Zap, title: 'Always Evolving', desc: 'Constantly improving to meet modern event demands.' },
            ].map((item, index) => (
              <ScrollReveal key={index} animation="fade-left" delay={index * 100}>
                <div className="flex items-start gap-4 p-4 hover:bg-card/50 rounded-lg transition-all duration-300">
                  <item.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal animation="fade-up" delay={300}>
            <p className="text-center text-lg text-muted-foreground mt-8 max-w-2xl mx-auto">
              EntryHive is not just a ticketing platform — it's a <span className="text-primary font-semibold">digital gateway</span> that connects people to experiences they care about.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ScrollReveal animation="fade-right">
              <div className="p-8 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:scale-[1.02]">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">🎯 Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To empower event organizers with smart tools and give attendees a seamless, 
                  trustworthy way to access events—making every entry count.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={150}>
              <div className="p-8 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:scale-[1.02]">
                <Eye className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">🌟 Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become the most trusted and innovative ticketing platform, 
                  redefining how people access events in a connected world.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              🐝 <InteractiveText text="EntryHive Stands For" />
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={150}>
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              {['Efficiency', 'Community', 'Trust', 'Innovation'].map((value, index) => (
                <span 
                  key={value} 
                  className="px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-default hover:scale-110"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {value}
                </span>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto">
              Just like a hive, everything works together smoothly—creating value for everyone involved.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Image Slider */}
      <ImageSlider />

      <Footer />
    </div>
  );
};

export default AboutUs;