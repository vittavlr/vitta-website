import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AnnouncementsPopup() {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.getAnnouncements().then(setItems).catch(() => {});
  }, []);

  if (items.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="fixed top-24 left-5 z-30 w-72 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(74,68,51,0.12)] p-4"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif text-sm">📢 Announcements</h3>
          <button onClick={() => setDismissed(true)} className="text-bronze/50 hover:text-bronze text-sm leading-none">✕</button>
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
    </AnimatePresence>
  );
}
