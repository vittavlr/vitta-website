import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function RecoveryReset() {
  const [form, setForm] = useState({ email: '', recovery_code: '', new_password: '', new_email: '', new_phone: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      await api.recoveryReset({
        email: form.email,
        recovery_code: form.recovery_code,
        new_password: form.new_password,
        new_email: form.new_email || undefined,
        new_phone: form.new_phone || undefined,
      });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      {status === 'done' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card w-full max-w-sm text-center">
          <div className="text-3xl mb-3">✓</div>
          <h1 className="font-serif text-2xl mb-2">Account recovered</h1>
          <p className="text-sm text-bronze/70 mb-6">You can now sign in with your new password.</p>
          <button className="btn-primary w-full justify-center" onClick={() => navigate('/vitta-private')}>
            Go to login
          </button>
        </motion.div>
      ) : (
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="card w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl">Account Recovery</h1>
            <p className="text-xs text-bronze/50 mt-1">
              Bypasses email verification — use only if you've lost access to your account email.
            </p>
          </div>

          <label className="text-sm font-medium">Account email (current)</label>
          <input required type="email" value={form.email} onChange={update('email')} className="mt-1 mb-4 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />

          <label className="text-sm font-medium">Recovery code</label>
          <input required value={form.recovery_code} onChange={update('recovery_code')} className="mt-1 mb-4 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />

          <label className="text-sm font-medium">New password</label>
          <input required type="password" minLength={8} value={form.new_password} onChange={update('new_password')} className="mt-1 mb-4 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />

          <label className="text-sm font-medium">New email (optional)</label>
          <input type="email" value={form.new_email} onChange={update('new_email')} className="mt-1 mb-4 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />

          <label className="text-sm font-medium">New phone (optional)</label>
          <input value={form.new_phone} onChange={update('new_phone')} className="mt-1 mb-6 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold" />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-60">
            {status === 'loading' ? 'Recovering…' : 'Reset account'}
          </button>

          <div className="text-center mt-5">
            <Link to="/vitta-private" className="text-xs text-bronze/50 hover:text-gold">Back to login</Link>
          </div>
        </motion.form>
      )}
    </div>
  );
}
