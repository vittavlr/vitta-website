import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AnnouncementsPopup() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    api.getAnnouncements().then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-24 left-0 z-30 flex items-start">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-72 max-h-[60vh] overflow-y-auto rounded-r-2xl rounded-l-none sm:rounded-2xl border border-fawn/40 bg-fawn/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(74,68,51,0.12)] p-4 ml-0 sm:ml-5"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-serif text-sm">📢 Announcements</h3>
              <button onClick={() => setOpen(false)} className="text-bronze/50 hover:text-bronze text-sm leading-none">✕</button>
            </div>
            <div className="space-y-3">
              {items.map((a) => (
                <div key={a.id} className="border-b border-bronze/10 pb-3 last:border-0 last:pb-0">
                  {a.link ? (
                    <Link to={a.link} className="text-sm font-semibold hover:text-gold">{a.title}</Link>
                  ) : (
                    <p className="text-sm font-semibold">{a.title}</p>
                  )}
                  <p className="text-xs text-bronze/70 mt-1">{a.message}</p>
                  {a.created_at && (
                    <p className="text-[10px] text-bronze/40 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 4 }}
            onClick={() => setOpen(true)}
            className="rounded-r-2xl border border-l-0 border-fawn/40 bg-fawn/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(74,68,51,0.12)] px-3 py-4 text-lg"
            aria-label="Show announcements"
            title="Announcements"
          >
            📢
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
