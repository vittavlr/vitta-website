import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import StarRating from './StarRating';

export default function ReviewModal({ onClose }) {
  const [form, setForm] = useState({ name: '', role: '', quote: '', rating: 5 });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.submitTestimonial({ ...form, rating: Number(form.rating) });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="card w-full max-w-md"
        >
          {status === 'done' ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="font-serif text-xl mb-2">Thank you!</h3>
              <p className="text-sm text-bronze/70 mb-6">
                Your review has been submitted and will appear on our site once reviewed.
              </p>
              <button onClick={onClose} className="btn-primary w-full justify-center">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-xl">Leave a Review</h3>
                <button type="button" onClick={onClose} className="text-bronze/50 hover:text-bronze text-xl leading-none">✕</button>
              </div>

              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
              />
              <input
                placeholder="Context (optional, e.g. Homeowner, Vellore)"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
              />
              <textarea
                required
                placeholder="Share your experience with VITTA"
                rows={4}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
              />
              <div>
                <label className="text-sm font-medium block mb-2">Your rating</label>
                <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              </div>

              {status === 'error' && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center disabled:opacity-60">
                {status === 'sending' ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
