import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export default function Contact() {
  const [searchParams] = useSearchParams();
  const prefilledService = searchParams.get('service') || '';
  const prefilledProperty = searchParams.get('property') || '';
  const prefilledPropertyId = searchParams.get('property_id') || '';

  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service_interest: prefilledService,
    message: prefilledProperty ? `Enquiring about: ${prefilledProperty}` : '',
    property_id: prefilledPropertyId || undefined,
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.submitLead(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', service_interest: '', message: '', property_id: undefined });
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
            {prefilledProperty && (
              <div className="text-sm bg-fawn rounded-lg px-4 py-2.5 text-bronze/80">
                Enquiring about <span className="font-semibold">{prefilledProperty}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input required value={form.name} onChange={update('name')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input required type="tel" value={form.phone} onChange={update('phone')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Email (optional)</label>
                <input type="email" value={form.email} onChange={update('email')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-sm font-medium">Type of service</label>
                <select required value={form.service_interest} onChange={update('service_interest')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold">
                  <option value="">Select a service</option>
                  {services.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message (optional)</label>
              <textarea rows={5} value={form.message} onChange={update('message')} className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />
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
