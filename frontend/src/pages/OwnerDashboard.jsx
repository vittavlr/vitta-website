import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import CredentialSettings from '../components/CredentialSettings';
import AdminDashboardBody from './AdminDashboardBody';

const TABS = ['Overview', 'Leads', 'Services', 'Properties', 'Team', 'Settings'];

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="section">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-1">Owner Dashboard</p>
          <h1 className="font-serif text-3xl">Welcome, {user?.name || user?.email}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-outline text-sm py-2 px-4">View Public Site</Link>
          <button onClick={doLogout} className="btn-outline text-sm py-2 px-4">Sign out</button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-bronze/10 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-gold text-gold' : 'border-transparent text-bronze/60 hover:text-bronze'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <Overview />}
      {tab === 'Team' && <TeamPanel />}
      {tab === 'Settings' && <CredentialSettings />}
      {/* Owner has all admin privileges too — reuse the admin panels for content/lead management */}
      {['Leads', 'Services', 'Properties'].includes(tab) && <AdminDashboardBody tab={tab} />}
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.leadStats().then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Inquiries', value: stats?.total_leads },
    { label: 'New This Month', value: stats?.leads_this_month },
    { label: 'Unactioned', value: stats?.new_leads },
  ];

  const byService = stats?.by_service || [];
  const maxCount = Math.max(1, ...byService.map((s) => s.count));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <p className="text-sm text-bronze/60 mb-2">{c.label}</p>
            <p className="font-serif text-4xl text-gold">{c.value ?? '—'}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h3 className="font-serif text-xl mb-5">Inquiries by service</h3>
        {byService.length === 0 ? (
          <p className="text-sm text-bronze/60">No inquiries yet.</p>
        ) : (
          <div className="space-y-3">
            {byService.map((s) => (
              <div key={s.service}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bronze/80">{s.service}</span>
                  <span className="text-bronze/50">{s.count}</span>
                </div>
                <div className="h-2.5 rounded-full bg-fawn overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-goldlight to-gold rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TeamPanel() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.listAdmins().then(setAdmins).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createAdmin(form);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this admin account?')) return;
    await api.deleteAdmin(id);
    load();
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 mb-6">
        {showForm ? 'Close' : '+ Add Admin'}
      </button>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} className="card space-y-3 mb-8 max-w-md">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <input required type="password" minLength={8} placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary text-sm py-2 px-4">Create Admin</button>
        </motion.form>
      )}

      {loading ? (
        <p className="text-bronze/60">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="text-bronze/60">No admin accounts yet.</p>
      ) : (
        <div className="space-y-3">
          {admins.map((a) => (
            <div key={a.id} className="card flex justify-between items-center">
              <div>
                <h4 className="font-serif text-lg">{a.name}</h4>
                <p className="text-sm text-bronze/60">{a.email}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-xs text-red-600">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
