import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CredentialSettings from '../components/CredentialSettings';
import AdminDashboardBody from './AdminDashboardBody';

const TABS = ['Leads', 'Services', 'Properties', 'Testimonials', 'Settings'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Leads');

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="section">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-1">Admin Dashboard</p>
          <h1 className="font-serif text-3xl">Welcome, {user?.name || user?.email}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-outline text-sm py-2 px-4">View Public Site</Link>
          <button onClick={doLogout} className="btn-outline text-sm py-2 px-4">Sign out</button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-bronze/10">
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

      {tab === 'Settings' ? <CredentialSettings /> : <AdminDashboardBody tab={tab} />}
    </div>
  );
}
