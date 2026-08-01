import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { useLang } from '../context/LangContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, lang, toggle } = useLang();

  const links = [
    { to: '/', label: t.home },
    { to: '/services', label: t.services },
    { to: '/listings', label: t.listings },
    { to: '/contact', label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-linen/95 backdrop-blur border-b border-bronze/10">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="VITTA" className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <div className="font-serif text-xl tracking-wide">
              V<span className="text-gold">I</span>TTA
            </div>
            <div className="text-[10px] tracking-[0.25em] text-bronze/50 uppercase">
              Builders &amp; Consultancy
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `pb-1 border-b-2 transition-colors ${
                  isActive ? 'text-gold border-gold' : 'border-transparent hover:text-gold'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggle} className="text-xs font-semibold text-bronze/50 hover:text-gold border border-bronze/20 rounded-full px-2.5 py-1" title="Switch language">
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          <Link to="/enquire" className="btn-primary text-sm py-2.5 px-5">
            {t.enquire}
          </Link>
        </div>

        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-bronze/10 bg-linen"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="uppercase text-sm tracking-wide">
                  {l.label}
                </NavLink>
              ))}
              <button onClick={toggle} className="text-xs font-semibold text-bronze/60 border border-bronze/20 rounded-full px-3 py-1.5 w-fit">
                {lang === 'en' ? 'தமிழில் காண' : 'View in English'}
              </button>
              <Link to="/enquire" onClick={() => setOpen(false)} className="btn-primary text-sm py-2.5 px-5 w-fit">
                {t.enquire}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
