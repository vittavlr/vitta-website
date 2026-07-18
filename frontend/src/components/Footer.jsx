import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Footer() {
  const [contact, setContact] = useState({ phone: null, email: null });

  useEffect(() => {
    api.getPublicContact().then(setContact).catch(() => {});
  }, []);

  return (
    <footer className="bg-fawn border-t border-bronze/10">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <div className="font-serif text-2xl">
            V<span className="text-gold">I</span>TTA
          </div>
          <div className="text-[10px] tracking-[0.25em] text-bronze/50 uppercase mb-4">
            Builders &amp; Consultancy Management
          </div>
          <p className="text-sm text-bronze/70 max-w-xs">
            One-stop solution for real estate, finance, insurance, mutual funds, legal counsel and
            college admissions.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-4">Navigate</div>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-gold">Home</Link>
            <Link to="/services" className="hover:text-gold">Services</Link>
            <Link to="/listings" className="hover:text-gold">Listings</Link>
            <Link to="/contact" className="hover:text-gold">Contact</Link>
          </div>
        </div>

        <div>
          <div className="eyebrow mb-4">Reach Us</div>
          <div className="flex flex-col gap-3 text-sm text-bronze/80">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="hover:text-gold flex items-center gap-2 w-fit">
                <span>📞</span> <span>{contact.phone}</span>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="hover:text-gold flex items-center gap-2 w-fit">
                <span>✉️</span> <span>{contact.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-bronze/10">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="eyebrow mb-4">Visit Us</div>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl overflow-hidden border border-bronze/10 h-64">
              <iframe
                title="VITTA office location"
                src="https://www.google.com/maps?q=Vellore,Tamil+Nadu,India&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="text-sm text-bronze/70 space-y-2">
              <p>Vellore, Tamil Nadu, India</p>
              {contact.phone && <a href={`tel:${contact.phone}`} className="hover:text-gold block">📞 {contact.phone}</a>}
              {contact.email && <a href={`mailto:${contact.email}`} className="hover:text-gold block">✉️ {contact.email}</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-4 pt-6">
        <Link to="/vitta-private" className="text-[11px] text-bronze/30 hover:text-gold">
          Admin access
        </Link>
      </div>

      <div className="text-center text-xs text-bronze/50 pb-6">
        © {new Date().getFullYear()} VITTA. All rights reserved.
      </div>
    </footer>
  );
}
