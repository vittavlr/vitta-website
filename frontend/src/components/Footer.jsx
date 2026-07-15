import { Link } from 'react-router-dom';

export default function Footer() {
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
          <div className="flex flex-col gap-2 text-sm text-bronze/80">
            <span>📞 9751655590</span>
            <span>✉️ owner@vittagroup.com</span>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-bronze/50 pb-6">
        © {new Date().getFullYear()} VITTA. All rights reserved.
      </div>
    </footer>
  );
}
