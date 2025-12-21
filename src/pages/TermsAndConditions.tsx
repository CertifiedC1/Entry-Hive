import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useEffect, useRef } from 'react';

const TermsAndConditions = () => {
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
        <h1 className="text-4xl font-bold mb-4 animate-fade-in">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          Welcome to EntryHive. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions.
        </p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">1. Platform Use</h2>
            <p className="text-muted-foreground">
              EntryHive provides digital ticketing services that allow organizers to create events and sell tickets, 
              while users can purchase and access tickets electronically.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
            <p className="text-muted-foreground mb-3">Users are responsible for:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Providing accurate information</li>
              <li>Safeguarding their account credentials</li>
              <li>Using the platform lawfully and ethically</li>
            </ul>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">3. Ticket Validity</h2>
            <p className="text-muted-foreground">
              Tickets are valid only for the specified event, date, and time. Unauthorized duplication, resale, 
              or misuse of tickets may result in cancellation without refund.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">4. Payments & Refunds</h2>
            <p className="text-muted-foreground">
              All payments are securely processed. Refund policies are determined by event organizers unless otherwise stated.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">5. Platform Availability</h2>
            <p className="text-muted-foreground">
              While we strive for uninterrupted service, EntryHive does not guarantee continuous availability 
              due to maintenance or unforeseen technical issues.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              EntryHive is not responsible for event cancellations, changes, or organizer misconduct. 
              Our role is strictly to facilitate ticketing services.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to update these terms at any time. Continued use of the platform 
              indicates acceptance of any changes.
            </p>
          </section>

          <section className="opacity-0 transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms and Conditions, please contact us at:<br />
              Email: support@entryhive.gmail.com<br />
              Phone: +254711653881
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

export default TermsAndConditions;