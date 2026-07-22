import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';

const SESSION_KEY = 'vitta_announcements_seen';

export default function AnnouncementsPopup() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.getAnnouncements().then((data) => {
      setItems(data);
      if (data.length > 0 && !sessionStorage.getItem(SESSION_KEY)) {
        setOpen(true);
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    }).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* Bell to reopen any time */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-24 right-5 z-30 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow flex items-center justify-center text-lg hidden md:flex"
        aria-label="View announcements"
        title="Announcements"
      >
        📢
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm max-h-[75vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl">📢 Announcements</h3>
                <button onClick={() => setOpen(false)} className="text-bronze/50 hover:text-bronze text-xl leading-none">✕</button>
              </div>
              <div className="space-y-3">
                {items.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 border-b border-bronze/10 pb-3 last:border-0 last:pb-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {a.link ? (
                        <Link to={a.link} onClick={() => setOpen(false)} className="text-sm font-semibold hover:text-gold">
                          {a.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold">{a.title}</p>
                      )}
                      <p className="text-xs text-bronze/50">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
