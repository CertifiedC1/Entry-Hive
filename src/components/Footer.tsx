import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Tiko</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted event ticketing platform
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-semibold mb-4">Pages</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
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
              <p className="font-semibold text-foreground">Tiko</p>
              <p>Nairobi, Kenya</p>
              <p className="font-semibold text-foreground mt-4">Ticketing Issues:</p>
              <a href="mailto:support@tiko.com" className="text-primary hover:underline">
                support@tiko.com
              </a>
              <p className="font-semibold text-foreground mt-4">Event Listing:</p>
              <a href="mailto:events@tiko.com" className="text-primary hover:underline">
                events@tiko.com
              </a>
              <p>(+254) 712345678</p>
            </div>
          </div>

          {/* Stay in Touch */}
          <div>
            <h4 className="font-semibold mb-4">Stay In Touch With Us</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © Copyright {new Date().getFullYear()} | Tiko
          </p>
        </div>
      </div>
    </footer>
  );
};
