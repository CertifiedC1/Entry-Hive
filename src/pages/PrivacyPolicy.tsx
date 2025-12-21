import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useEffect, useRef } from 'react';

const PrivacyPolicy = () => {
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = sectionsRef.current?.querySelectorAll('section');
    sections?.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl" ref={sectionsRef}>
        <h1 className="text-4xl font-bold mb-4 animate-fade-in">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          At EntryHive, your privacy and data security are our top priorities.
        </p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Personal details (name, email, phone number)</li>
              <li>Transaction and ticketing data</li>
              <li>Device and usage data for performance improvement</li>
            </ul>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>To process ticket purchases and event access</li>
              <li>To improve platform functionality and user experience</li>
              <li>To communicate important updates and notifications</li>
            </ul>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
            <p className="text-muted-foreground">
              We use industry-standard security measures to protect user data against unauthorized access, loss, or misuse.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground">
              Payment processing and analytics may involve trusted third-party providers who comply with data protection standards.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-3">Users have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver 
              personalized content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or 
              through a notice on our platform. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights, contact us at:<br />
              Email: support@entryhive.gmail.com<br />
              Phone: +254711653881<br />
              Address: Nairobi, Kenya
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;