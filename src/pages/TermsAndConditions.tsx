import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Ticketyetu's ticketing platform, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Ticket Purchase and Use</h2>
            <p className="text-muted-foreground mb-3">
              All ticket sales are final unless an event is cancelled. Tickets are non-transferable and may not be 
              resold at a price higher than the face value without written permission from the event organizer.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Each ticket is valid for one person only</li>
              <li>Tickets must be presented (digital or printed) at the event entrance</li>
              <li>Lost or stolen tickets cannot be replaced</li>
              <li>We reserve the right to refuse entry or eject anyone without a valid ticket</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Payment Terms</h2>
            <p className="text-muted-foreground">
              All payments must be made in full at the time of booking. We accept Mpesa, Stripe, and Paystack payments. 
              All prices are displayed in Kenyan Shillings (KSh) unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Refund Policy</h2>
            <p className="text-muted-foreground">
              Refunds are only available if an event is cancelled by the organizer. In such cases, full refunds will 
              be processed within 14 business days. Service fees are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Event Changes and Cancellations</h2>
            <p className="text-muted-foreground">
              Event organizers reserve the right to make changes to event schedules, venues, or lineups. Ticketyetu 
              is not responsible for any changes made by event organizers. Customers will be notified of major changes 
              via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
            <p className="text-muted-foreground mb-3">Users agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate and truthful information</li>
              <li>Not engage in fraudulent activities</li>
              <li>Not attempt to circumvent our security measures</li>
              <li>Respect intellectual property rights</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Ticketyetu acts as an intermediary between event organizers and customers. We are not responsible for 
              the quality, safety, or legality of events. Our liability is limited to the ticket price paid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
            <p className="text-muted-foreground">
              Your use of our services is also governed by our Privacy Policy. We are committed to protecting your 
              personal information in accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on the Ticketyetu platform, including logos, text, graphics, and software, is the property 
              of Ticketyetu or its content suppliers and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon 
              posting. Your continued use of the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms and Conditions, please contact us at:<br />
              Email: support@ticketyetu.com<br />
              Phone: +254 793 333 888
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
