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
              <p className="text-sm text-bronze/60">
                {l.phone} {l.email && `· ${l.email}`}
              </p>
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
          {l.message && <p className="text-sm text-bronze/80 mt-3">{l.message}</p>}
          <button onClick={() => remove(l.id)} className="text-xs text-red-600 mt-3">Delete</button>
        </motion.div>
      ))}
    </div>
  );
}

const emptyService = { title: '', slug: '', short_description: '', full_description: '' };

function ServicesPanel() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newService, setNewService] = useState(emptyService);
  const [error, setError] = useState('');

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

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const createService = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createService({
        title: newService.title,
        slug: newService.slug || slugify(newService.title),
        short_description: newService.short_description,
        full_description: newService.full_description,
        order: services.length + 1,
      });
      setNewService(emptyService);
      setCreating(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-bronze/60">Loading services…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-bronze/60">{services.length} service{services.length === 1 ? '' : 's'} listed — this count shows live on the homepage.</p>
        <button onClick={() => setCreating(!creating)} className="btn-primary text-sm py-2 px-4">
          {creating ? 'Close' : '+ Add Service'}
        </button>
      </div>

      {creating && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createService} className="card space-y-3 mb-6">
          <input required placeholder="Service title (e.g. Tax Advisory)" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <textarea required placeholder="Short description (shown on cards)" rows={2} value={newService.short_description} onChange={(e) => setNewService({ ...newService, short_description: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <textarea required placeholder="Full description (shown on the service page)" rows={4} value={newService.full_description} onChange={(e) => setNewService({ ...newService, full_description: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary text-sm py-2 px-4">Add Service</button>
        </motion.form>
      )}

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
    </div>
  );
}

const emptyProperty = {
  title: '', location: '', price: '', property_type: 'apartment', description: '',
  bedrooms: '', bathrooms: '', area_sqft: '', status: 'available', featured: false,
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PropertiesPanel() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProperty);
  const [photos, setPhotos] = useState([]); // [{name, dataUrl}]
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => api.getProperties().then(setProperties).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const onPhotosSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const converted = await Promise.all(
        files.map(async (f) => ({ name: f.name, dataUrl: await fileToDataUrl(f) }))
      );
      setPhotos((prev) => [...prev, ...converted]);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      images: photos.map((p) => p.dataUrl),
    };
    await api.createProperty(payload);
    setForm(emptyProperty);
    setPhotos([]);
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

          <div>
            <label className="text-sm font-medium block mb-1">Photos</label>
            <input type="file" accept="image/*" multiple onChange={onPhotosSelected} className="text-sm" />
            {uploading && <p className="text-xs text-bronze/50 mt-1">Processing photos…</p>}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p.dataUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md border border-bronze/20" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-white rounded-full w-5 h-5 text-xs border border-bronze/20">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <div className="flex gap-3 items-center">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-14 h-14 object-cover rounded-md" />}
                <div>
                  <h4 className="font-serif text-lg">{p.title}</h4>
                  <p className="text-sm text-bronze/60">{p.location} · {p.status.replace('_', ' ')}</p>
                </div>
              </div>
              <button onClick={() => remove(p.id)} className="text-xs text-red-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
