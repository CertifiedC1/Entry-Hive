import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EntryHiveLogo } from './EntryHiveLogo';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div>
            <EntryHiveLogo size="md" className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Your trusted digital ticketing platform. Fast, secure, and fraud-resistant entry for all your events.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-semibold mb-4 text-gradient-gold">Pages</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-muted-foreground link-underline hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground link-underline hover:text-primary transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground link-underline hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground link-underline hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold mb-4 text-gradient-gold">Contact Us</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">EntryHive</p>
              <p>Nairobi, Kenya</p>
              <p className="font-semibold text-foreground mt-4">Support:</p>
              <a href="mailto:support@entryhive.com" className="text-primary hover:underline hover-scale inline-block">
                support@entryhive.com
              </a>
              <p className="font-semibold text-foreground mt-4">Phone:</p>
              <a href="tel:+254711653881" className="text-primary hover:underline hover-scale inline-block">
                +254 711 653 881
              </a>
            </div>
          </div>

          {/* Stay in Touch */}
          <div>
            <h4 className="font-semibold mb-4 text-gradient-gold">Stay In Touch With Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon text-muted-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://www.twitter.com/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon text-muted-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon text-muted-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/company/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon text-muted-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Follow us for updates on events and exclusive offers!
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © Copyright {new Date().getFullYear()} | <span className="text-gradient-gold font-semibold">EntryHive</span> - Digital Ticketing Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
