import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';

export default function AdminDashboardBody({ tab }) {
  return (
    <>
      {tab === 'Leads' && <LeadsPanel />}
      {tab === 'Services' && <ServicesPanel />}
      {tab === 'Properties' && <PropertiesPanel />}
    </>
  );
}

function LeadsPanel() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.listLeads().then(setLeads).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.updateLead(id, { status });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this lead?')) return;
    await api.deleteLead(id);
    load();
  };

  if (loading) return <p className="text-bronze/60">Loading leads…</p>;
  if (leads.length === 0) return <p className="text-bronze/60">No inquiries yet.</p>;

  return (
    <div className="space-y-4">
      {leads.map((l) => (
        <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h4 className="font-serif text-lg">{l.name}</h4>
              <p className="text-sm text-bronze/60">{l.email} {l.phone && `· ${l.phone}`}</p>
              {l.service_interest && <p className="text-xs text-gold mt-1">{l.service_interest}</p>}
            </div>
            <select
              value={l.status}
              onChange={(e) => setStatus(l.id, e.target.value)}
              className="h-fit rounded-lg border border-bronze/20 bg-white/70 px-3 py-1.5 text-sm"
            >
              {['new', 'contacted', 'in_progress', 'closed'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-bronze/80 mt-3">{l.message}</p>
          <button onClick={() => remove(l.id)} className="text-xs text-red-600 mt-3">Delete</button>
        </motion.div>
      ))}
    </div>
  );
}

function ServicesPanel() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => api.getServices().then(setServices).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.updateService(editing.id, {
      title: editing.title,
      short_description: editing.short_description,
      full_description: editing.full_description,
    });
    setEditing(null);
    load();
  };

  if (loading) return <p className="text-bronze/60">Loading services…</p>;

  return (
    <div className="space-y-4">
      {services.map((s) => (
        <div key={s.id} className="card">
          {editing?.id === s.id ? (
            <form onSubmit={save} className="space-y-3">
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 font-serif text-lg"
              />
              <textarea
                value={editing.short_description}
                onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
                placeholder="Short description (shown on cards)"
              />
              <textarea
                value={editing.full_description}
                onChange={(e) => setEditing({ ...editing, full_description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
                placeholder="Full description (shown on service page)"
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary text-sm py-2 px-4">Save — updates live instantly</button>
                <button type="button" onClick={() => setEditing(null)} className="text-sm text-bronze/60">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-serif text-lg">{s.title}</h4>
                <p className="text-sm text-bronze/60">{s.short_description}</p>
              </div>
              <button onClick={() => setEditing(s)} className="btn-outline text-sm py-1.5 px-4">Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const emptyProperty = {
  title: '', location: '', price: '', property_type: 'apartment', description: '',
  bedrooms: '', bathrooms: '', area_sqft: '', images: '', status: 'available', featured: false,
};

function PropertiesPanel() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProperty);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.getProperties().then(setProperties).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    await api.createProperty(payload);
    setForm(emptyProperty);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.deleteProperty(id);
    load();
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 mb-6">
        {showForm ? 'Close' : '+ Add Property'}
      </button>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} className="card space-y-3 mb-8">
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <input required placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <input placeholder="Price (e.g. ₹85 Lakh)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm">
              {['apartment', 'villa', 'plot', 'commercial'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <input type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <input type="number" placeholder="Area (sqft)" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm">
              {['available', 'sold', 'coming_soon'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <input placeholder="Image URLs, comma-separated" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured listing
          </label>
          <button type="submit" className="btn-primary text-sm py-2 px-4">Add Property</button>
        </motion.form>
      )}

      {loading ? (
        <p className="text-bronze/60">Loading…</p>
      ) : properties.length === 0 ? (
        <p className="text-bronze/60">No listings yet — add one above.</p>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="card flex justify-between items-start gap-4">
              <div>
                <h4 className="font-serif text-lg">{p.title}</h4>
                <p className="text-sm text-bronze/60">{p.location} · {p.status.replace('_', ' ')}</p>
              </div>
              <button onClick={() => remove(p.id)} className="text-xs text-red-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
