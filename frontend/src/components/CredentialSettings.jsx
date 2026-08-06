import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const PURPOSES = {
  password_change: { label: 'Password', placeholder: 'New password (min 8 characters)', type: 'password' },
  email_change: { label: 'Email', placeholder: 'New email address', type: 'email' },
  phone_change: { label: 'Phone', placeholder: 'New phone number', type: 'tel' },
};

export default function CredentialSettings() {
  const { user, setUser, logout } = useAuth();
  const [purpose, setPurpose] = useState(null); // which field is being changed
  const [newValue, setNewValue] = useState('');
  const [stage, setStage] = useState('input'); // input | otp | done
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPurpose(null);
    setNewValue('');
    setStage('input');
    setOtp('');
    setDevOtp('');
    setError('');
  };

  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.requestOtp(purpose, purpose === 'password_change' ? undefined : newValue);
      setMsg(res.message);
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setStage('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp(purpose, otp, newValue);
      setStage('done');
      if (purpose === 'email_change' && res.new_email) {
        setUser({ ...user, email: res.new_email });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-lg">
      <h3 className="font-serif text-2xl mb-1">Account Settings</h3>
      <p className="text-sm text-bronze/60 mb-6">
        Changes to your password, email, or phone require a verification code sent to your current
        email ({user?.email}).
      </p>

      {!purpose && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(PURPOSES).map(([key, cfg]) => (
            <button key={key} onClick={() => setPurpose(key)} className="btn-outline text-sm py-2 px-4">
              Change {cfg.label}
            </button>
          ))}
        </div>
      )}

      {purpose && stage === 'input' && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={requestCode} className="space-y-4">
          <label className="text-sm font-medium">{PURPOSES[purpose].label}</label>
          <input
            required
            type={PURPOSES[purpose].type}
            minLength={purpose === 'password_change' ? 8 : undefined}
            placeholder={PURPOSES[purpose].placeholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full rounded-lg border border-bronze/20 bg-fawn/70 px-4 py-2.5 outline-none focus:border-gold"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2 px-4 disabled:opacity-60">
              {loading ? 'Sending code…' : 'Send verification code'}
            </button>
            <button type="button" onClick={reset} className="text-sm text-bronze/60">Cancel</button>
          </div>
        </motion.form>
      )}

      {purpose && stage === 'otp' && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={confirmCode} className="space-y-4">
          <p className="text-sm text-bronze/70">{msg}</p>
          {devOtp && (
            <p className="text-xs bg-fawn rounded p-2">
              Dev mode (SMTP not configured): your code is <strong>{devOtp}</strong>
            </p>
          )}
          <label className="text-sm font-medium">6-digit code</label>
          <input
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-lg border border-bronze/20 bg-fawn/70 px-4 py-2.5 outline-none focus:border-gold tracking-[0.3em] text-center"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2 px-4 disabled:opacity-60">
              {loading ? 'Verifying…' : 'Confirm'}
            </button>
            <button type="button" onClick={reset} className="text-sm text-bronze/60">Cancel</button>
          </div>
        </motion.form>
      )}

      {stage === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-green-700 text-sm mb-4">
            ✓ {PURPOSES[purpose].label} updated successfully.
            {purpose !== 'phone_change' && ' You may need to sign in again.'}
          </p>
          <div className="flex gap-3">
            <button onClick={reset} className="btn-outline text-sm py-2 px-4">Done</button>
            {purpose === 'password_change' && (
              <button onClick={logout} className="text-sm text-bronze/60">Sign out now</button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
