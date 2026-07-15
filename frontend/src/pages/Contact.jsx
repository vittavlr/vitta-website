import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

const serviceOptions = [
  'Real Estate', 'Finance', 'Insurance', 'Mutual Funds', 'Legal Counsel', 'College Admissions', 'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service_interest: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.submitLead(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', service_interest: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="section max-w-2xl">
      <p className="eyebrow mb-3">Contact</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-4">Let's think it through — together.</h1>
      <p className="text-bronze/70 mb-10">
        Tell us a little about what you need, and we'll get back to you shortly.
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-16"
          >
            <div className="text-4xl mb-4">✓</div>
            <h2 className="font-serif text-2xl mb-2">Thank you.</h2>
            <p className="text-bronze/70">We've received your inquiry and will be in touch shortly.</p>
            <button className="btn-outline mt-8" onClick={() => setStatus('idle')}>Send another</button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={submit}
            className="card space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input required value={form.name} onChange={update('name')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input required type="email" value={form.email} onChange={update('email')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Phone (optional)</label>
                <input value={form.phone} onChange={update('phone')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-sm font-medium">Interested in</label>
                <select value={form.service_interest} onChange={update('service_interest')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold">
                  <option value="">Select a service</option>
                  {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea required rows={5} value={form.message} onChange={update('message')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
            </div>

            {status === 'error' && <p className="text-red-600 text-sm">{errorMsg}</p>}

            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center disabled:opacity-60">
              {status === 'sending' ? 'Sending…' : 'Submit Inquiry'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
