import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ReviewModal from './ReviewModal';

export default function Footer() {
  const [contact, setContact] = useState({ phone: null, email: null });
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    api.getPublicContact().then(setContact).catch(() => {});
  }, []);

  return (
    <footer className="bg-fawn border-t border-bronze/15">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-serif text-2xl">
            V<span className="text-gold">I</span>TTA
          </div>
          <div className="text-[10px] tracking-[0.25em] text-bronze/50 uppercase mb-4">
            Builders &amp; Consultancy Management
          </div>
          <p className="text-sm text-bronze/70 max-w-xs mb-5">
            One-stop solution for real estate, finance, insurance, mutual funds, legal counsel and
            college admissions.
          </p>
          <button onClick={() => setShowReview(true)} className="text-sm text-gold font-semibold hover:underline">
            ★ Leave a review
          </button>
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
          <div className="flex flex-col gap-3 text-sm text-bronze/80 mb-5">
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
            <p className="text-xs text-bronze/60">Vellore, Tamil Nadu, India</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-bronze/10 h-24 w-full">
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
        </div>
      </div>

      <div className="text-center pb-3 pt-1">
        <Link to="/vitta-private" className="text-[11px] text-bronze/30 hover:text-gold">
          Admin access
        </Link>
      </div>

      <div className="text-center text-xs text-bronze/50 pb-4">
        © {new Date().getFullYear()} VITTA. All rights reserved.
      </div>

      {showReview && <ReviewModal onClose={() => setShowReview(false)} />}
    </footer>
  );
}
