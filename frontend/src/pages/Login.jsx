import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.role === 'owner' ? '/vitta-private/owner' : '/vitta-private/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="card w-full max-w-sm"
      >
        <Link to="/" className="text-xs text-bronze/50 hover:text-gold mb-4 inline-block">← Back to public site</Link>
        <div className="text-center mb-8">
          <img src={logo} alt="VITTA" className="h-14 w-14 mx-auto mb-3" />
          <h1 className="font-serif text-2xl">Team Login</h1>
          <p className="text-xs text-bronze/50 mt-1">Restricted access</p>
        </div>

        <label className="text-sm font-medium">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 mb-4 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold"
        />

        <label className="text-sm font-medium">Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 mb-6 w-full rounded-lg border border-bronze/20 bg-white/70 px-4 py-2.5 outline-none focus:border-gold"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="text-center mt-5">
          <Link to="/vitta-private/recovery" className="text-xs text-bronze/50 hover:text-gold">
            Can't access your email? Use a recovery code
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
