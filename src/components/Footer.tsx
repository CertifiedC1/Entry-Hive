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
            <h4 className="font-semibold mb-4">Pages</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">EntryHive</p>
              <p>Nairobi, Kenya</p>
              <p className="font-semibold text-foreground mt-4">Support:</p>
              <a href="mailto:support@entryhive.gmail.com" className="text-primary hover:underline">
                support@entryhive.gmail.com
              </a>
              <p className="font-semibold text-foreground mt-4">Phone:</p>
              <a href="tel:+254711653881" className="text-primary hover:underline">
                +254 711 653 881
              </a>
            </div>
          </div>

          {/* Stay in Touch */}
          <div>
            <h4 className="font-semibold mb-4">Stay In Touch With Us</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/entryhive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © Copyright {new Date().getFullYear()} | EntryHive - Digital Ticketing Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
