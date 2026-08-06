import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import CredentialSettings from '../components/CredentialSettings';
import ProfileEditor from '../components/ProfileEditor';
import AdminDashboardBody from './AdminDashboardBody';

const TABS = ['Overview', 'Leads', 'Services', 'Properties', 'Testimonials', 'Announcements', 'Team', 'Activity', 'Settings'];

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
      {tab === 'Activity' && <ActivityPanel />}
      {tab === 'Settings' && (
        <>
          <CredentialSettings />
          <ProfileEditor />
        </>
      )}
      {/* Owner has all admin privileges too — reuse the admin panels for content/lead management */}
      {['Leads', 'Services', 'Properties', 'Testimonials', 'Announcements'].includes(tab) && <AdminDashboardBody tab={tab} />}
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
  const byProperty = stats?.by_property || [];
  const maxCount = Math.max(1, ...byService.map((s) => s.count));
  const [hoveredBar, setHoveredBar] = useState(null);

  const downloadCsv = async () => {
    const blob = await api.exportLeadsCsv();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vitta-leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={downloadCsv} className="btn-outline text-sm py-2 px-4">Export leads as CSV ↓</button>
      </div>

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
        <h3 className="font-serif text-xl mb-1">Inquiries by service</h3>
        <p className="text-xs text-bronze/50 mb-6">Hover a bar for details — Real Estate breaks down by property.</p>
        {byService.length === 0 ? (
          <p className="text-sm text-bronze/60">No inquiries yet.</p>
        ) : (
          <div>
            <div className="flex items-end gap-4 h-56 flex-wrap justify-center px-2 border-b border-bronze/20 pb-0">
              {byService.map((s, i) => {
                const isRealEstate = s.service.toLowerCase() === 'real estate';
                return (
                  <div
                    key={s.service}
                    className="relative flex flex-col items-center justify-end h-full w-16 shrink-0"
                    onMouseEnter={() => setHoveredBar(s.service)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <AnimatePresence>
                      {hoveredBar === s.service && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute bottom-full mb-2 z-10 w-48 card p-3 text-left pointer-events-none"
                        >
                          {isRealEstate ? (
                            byProperty.length > 0 ? (
                              <>
                                <p className="text-xs font-semibold mb-1">By property:</p>
                                {byProperty.map((p) => (
                                  <div key={p.property} className="flex justify-between text-xs text-bronze/70">
                                    <span className="truncate mr-2">{p.property}</span>
                                    <span>{p.count}</span>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <p className="text-xs text-bronze/60">No property-specific inquiries yet.</p>
                            )
                          ) : (
                            <p className="text-xs text-bronze/70">{s.count} inquiry{s.count === 1 ? '' : 'ies'} for {s.service}.</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className="text-xs text-bronze/60 mb-1">{s.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((s.count / maxCount) * 100, 6)}%` }}
                      transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="w-8 rounded-t-md bg-gradient-to-t from-gold to-goldlight cursor-default"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-start gap-4 flex-wrap justify-center px-2 mt-2">
              {byService.map((s) => (
                <div key={s.service} className="w-16 shrink-0 text-center">
                  <span className="text-[10px] text-bronze/60 leading-tight break-words">{s.service}</span>
                </div>
              ))}
            </div>
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
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-fawn/70 px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-fawn/70 px-3 py-2 text-sm" />
          <input required type="password" minLength={8} placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-fawn/70 px-3 py-2 text-sm" />
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

function ActivityPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.getActivityLog().then(setEntries).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const removeEntry = async (id) => {
    await api.deleteActivityEntry(id);
    load();
  };

  const clearAll = async () => {
    if (!confirm('Clear the entire activity log? This cannot be undone.')) return;
    await api.clearActivityLog();
    load();
  };

  if (loading) return <p className="text-bronze/60">Loading…</p>;
  if (entries.length === 0) return <p className="text-bronze/60">No activity recorded yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={clearAll} className="text-xs text-red-600">Clear all</button>
      </div>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="card flex justify-between items-center gap-4 py-3">
            <div>
              <p className="text-sm">{e.action}</p>
              <p className="text-xs text-bronze/50">{e.user_email}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <p className="text-xs text-bronze/40 whitespace-nowrap">
                {e.created_at ? new Date(e.created_at).toLocaleString() : ''}
              </p>
              <button onClick={() => removeEntry(e.id)} className="text-xs text-red-600">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
