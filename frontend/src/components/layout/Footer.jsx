import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { newsletterAPI } from '../../services/api';
import toast from 'react-hot-toast';

const footerLinks = {
  Shop: [
    { label: "New Arrivals", to: "/shop?isNewArrival=true" },
    { label: "Women's Collection", to: "/shop?gender=women" },
    { label: "Men's Collection", to: "/shop?gender=men" },
    { label: "Best Sellers", to: "/shop?isBestSeller=true" },
    { label: "Sale", to: "/shop?isOnSale=true" },
  ],
  Help: [
    { label: "Contact Us", to: "/contact" },
    { label: "FAQs", to: "/contact#faq" },
    { label: "Order Tracking", to: "/orders" },
    { label: "Returns & Refunds", to: "/returns-refunds" },
    { label: "Size Guide", to: "/size-guide" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms-and-conditions" },
    { label: "Sustainability", to: "/sustainability" },
  ],
};

const socials = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await newsletterAPI.subscribe(email);
      toast.success('Thank you for subscribing!');
      setEmail('');
    } catch {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-luxe-black text-white">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="page-container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="section-tag text-luxe-gold">Newsletter</span>
              <h3 className="font-display text-2xl font-medium text-white">Stay in the loop</h3>
              <p className="text-white/50 text-sm mt-1">Get exclusive offers, style tips, and early access to new collections.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-0 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 md:w-72 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-luxe-gold transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-luxe-gold text-white px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-luxe-gold/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? 'Subscribing...' : <><span>Subscribe</span><ArrowRight size={14}/></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="font-display text-2xl font-semibold tracking-widest text-white">
              LUXE
            </Link>
            <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-xs">
              Crafting timeless fashion for the modern individual. Quality, sustainability, and elegance in every piece.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-4 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:border-luxe-gold hover:text-luxe-gold transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <MapPin size={14} className="text-luxe-gold flex-shrink-0" />
                <span>123 Fashion Street, Mumbai, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Phone size={14} className="text-luxe-gold flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Mail size={14} className="text-luxe-gold flex-shrink-0" />
                <span>hello@luxe.com</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-2xs font-medium tracking-super-wide uppercase text-luxe-gold mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} LUXE Fashion. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* Payment icons */}
            <div className="flex items-center gap-3">
              {['Visa', 'MC', 'UPI', 'RazorPay'].map(p => (
                <span key={p} className="text-white/20 text-2xs font-medium border border-white/10 px-2 py-1">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
