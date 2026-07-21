import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { compressImageFile } from '../imageUtils';

export default function AdminDashboardBody({ tab }) {
  return (
    <>
      {tab === 'Leads' && <LeadsPanel />}
      {tab === 'Services' && <ServicesPanel />}
      {tab === 'Properties' && <PropertiesPanel />}
      {tab === 'Testimonials' && <TestimonialsPanel />}
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

  const setFollowUp = async (id, follow_up_date) => {
    await api.updateLead(id, { follow_up_date });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this lead?')) return;
    await api.deleteLead(id);
    load();
  };

  const downloadCsv = async () => {
    const blob = await api.exportLeadsCsv();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vitta-leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-bronze/60">Loading leads…</p>;
  if (leads.length === 0) return <p className="text-bronze/60">No inquiries yet.</p>;

  // Group by service; groups with more than 2 leads render as a compact table,
  // smaller groups (and leads with no service set) render as individual cards.
  const groups = {};
  leads.forEach((l) => {
    const key = l.service_interest || 'Not specified';
    if (!groups[key]) groups[key] = [];
    groups[key].push(l);
  });

  // Same phone number showing up on multiple OPEN (non-closed) enquiries —
  // likely the same client, worth flagging so admins don't treat them as separate leads.
  const openPhoneCounts = {};
  leads.forEach((l) => {
    if (l.status === 'closed') return;
    openPhoneCounts[l.phone] = (openPhoneCounts[l.phone] || 0) + 1;
  });

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (l) => l.follow_up_date && l.follow_up_date < today && l.status !== 'closed';

  const STATUS_OPTIONS = ['new', 'contacted', 'in_progress', 'closed'];

  const LeadCard = (l) => (
    <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h4 className="font-serif text-lg">{l.name}</h4>
          <p className="text-sm text-bronze/60">
            {l.phone} {l.email && `· ${l.email}`}
          </p>
          {l.service_interest && <p className="text-xs text-gold mt-1">{l.service_interest}</p>}
          {l.property_title && <p className="text-xs text-bronze/50 mt-1">Property: {l.property_title}</p>}
          {openPhoneCounts[l.phone] > 1 && (
            <p className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 mt-1.5 w-fit">
              ⚠ {openPhoneCounts[l.phone]} open enquiries from this number
            </p>
          )}
          {isOverdue(l) && (
            <p className="text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5 mt-1.5 w-fit">
              ⏰ Follow-up overdue ({l.follow_up_date})
            </p>
          )}
        </div>
        <select
          value={l.status}
          onChange={(e) => setStatus(l.id, e.target.value)}
          className="h-fit rounded-lg border border-bronze/20 bg-white/70 px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      {l.message && <p className="text-sm text-bronze/80 mt-3">{l.message}</p>}
      <div className="flex items-center gap-3 mt-3">
        <label className="text-xs text-bronze/50">Follow up by:</label>
        <input
          type="date"
          value={l.follow_up_date || ''}
          onChange={(e) => setFollowUp(l.id, e.target.value)}
          className="rounded border border-bronze/20 bg-white/70 px-2 py-1 text-xs"
        />
        <button onClick={() => remove(l.id)} className="text-xs text-red-600 ml-auto">Delete</button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={downloadCsv} className="btn-outline text-sm py-2 px-4">Export leads as CSV ↓</button>
      </div>

      {Object.entries(groups).map(([service, group]) =>
        group.length > 2 ? (
          <div key={service}>
            <h3 className="font-serif text-lg mb-3">{service} <span className="text-sm text-bronze/50 font-sans">({group.length} inquiries)</span></h3>
            <div className="card p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bronze/10 text-left text-bronze/60">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Property</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Follow up</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((l) => (
                    <tr key={l.id} className="border-b border-bronze/5 last:border-0">
                      <td className="px-4 py-3">
                        {l.name}
                        {openPhoneCounts[l.phone] > 1 && <span title="Multiple open enquiries from this number" className="ml-1">⚠</span>}
                      </td>
                      <td className="px-4 py-3">{l.phone}</td>
                      <td className="px-4 py-3">{l.email || '—'}</td>
                      <td className="px-4 py-3">{l.property_title || '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={l.status}
                          onChange={(e) => setStatus(l.id, e.target.value)}
                          className="rounded-lg border border-bronze/20 bg-white/70 px-2 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={l.follow_up_date || ''}
                          onChange={(e) => setFollowUp(l.id, e.target.value)}
                          className={`rounded border px-2 py-1 text-xs ${isOverdue(l) ? 'border-red-400 bg-red-50' : 'border-bronze/20 bg-white/70'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => remove(l.id)} className="text-xs text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div key={service} className="space-y-4">
            {group.map((l) => LeadCard(l))}
          </div>
        )
      )}
    </div>
  );
}

const emptyService = { title: '', slug: '', short_description: '', full_description: '', image: null };

function ServicesPanel() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [managingItems, setManagingItems] = useState(null);
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
      faqs: editing.faqs || [],
      image: editing.image,
    });
    setEditing(null);
    load();
  };

  const onEditImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file);
    setEditing({ ...editing, image: dataUrl });
  };

  const onNewImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file);
    setNewService({ ...newService, image: dataUrl });
  };

  const addFaq = () => setEditing({ ...editing, faqs: [...(editing.faqs || []), { question: '', answer: '' }] });
  const updateFaq = (i, key, value) => {
    const faqs = [...editing.faqs];
    faqs[i] = { ...faqs[i], [key]: value };
    setEditing({ ...editing, faqs });
  };
  const removeFaq = (i) => setEditing({ ...editing, faqs: editing.faqs.filter((_, idx) => idx !== i) });

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
        image: newService.image,
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
          <div>
            <label className="text-sm font-medium block mb-1">Photo (optional — a themed illustration is used automatically if you skip this)</label>
            <input type="file" accept="image/*" onChange={onNewImageSelected} className="text-sm" />
            {newService.image && <img src={newService.image} alt="" className="w-24 h-16 object-cover rounded-md mt-2 border border-bronze/20" />}
          </div>
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

                <div>
                  <label className="text-sm font-medium block mb-1">Photo (optional — a themed illustration is used automatically if none is set)</label>
                  <input type="file" accept="image/*" onChange={onEditImageSelected} className="text-sm" />
                  {editing.image && <img src={editing.image} alt="" className="w-24 h-16 object-cover rounded-md mt-2 border border-bronze/20" />}
                  {editing.image && (
                    <button type="button" onClick={() => setEditing({ ...editing, image: null })} className="text-xs text-red-600 ml-3">Remove photo</button>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">FAQs</p>
                  <div className="space-y-2">
                    {(editing.faqs || []).map((faq, i) => (
                      <div key={i} className="flex gap-2 items-start bg-fawn/40 rounded-lg p-2">
                        <div className="flex-1 space-y-1">
                          <input
                            placeholder="Question"
                            value={faq.question}
                            onChange={(e) => updateFaq(i, 'question', e.target.value)}
                            className="w-full rounded border border-bronze/20 bg-white/70 px-2 py-1.5 text-xs"
                          />
                          <textarea
                            placeholder="Answer"
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                            className="w-full rounded border border-bronze/20 bg-white/70 px-2 py-1.5 text-xs"
                          />
                        </div>
                        <button type="button" onClick={() => removeFaq(i)} className="text-xs text-red-600 shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addFaq} className="text-xs text-gold mt-2">+ Add FAQ</button>
                </div>

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
                <div className="flex gap-2">
                  <button onClick={() => setManagingItems(managingItems === s.slug ? null : s.slug)} className="btn-outline text-sm py-1.5 px-4">
                    {managingItems === s.slug ? 'Close Listings' : 'Manage Listings'}
                  </button>
                  <button onClick={() => setEditing(s)} className="btn-outline text-sm py-1.5 px-4">Edit</button>
                </div>
              </div>
            )}
            {managingItems === s.slug && <ServiceItemsManager slug={s.slug} />}
          </div>
        ))}
      </div>
    </div>
  );
}


const emptyServiceItem = { title: '', description: '', link: '', map_link: '' };

function ServiceItemsManager({ slug }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyServiceItem);
  const [photos, setPhotos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.getServiceItems(slug).then(setItems).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [slug]);

  const onPhotosSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const converted = await Promise.all(files.map((f) => compressImageFile(f)));
    setPhotos((prev) => [...prev, ...converted]);
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyServiceItem);
    setPhotos([]);
    setShowForm(true);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, link: item.link || '', map_link: item.map_link || '' });
    setPhotos(item.photos || []);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.updateServiceItem(editingId, { ...form, photos });
    } else {
      await api.createServiceItem(slug, { ...form, photos });
    }
    setForm(emptyServiceItem);
    setPhotos([]);
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.deleteServiceItem(id);
    load();
  };

  return (
    <div className="mt-4 pt-4 border-t border-bronze/10">
      <button onClick={() => (showForm ? setShowForm(false) : startCreate())} className="btn-outline text-sm py-1.5 px-4 mb-4">
        {showForm ? 'Close' : '+ Add Listing'}
      </button>

      {showForm && (
        <form onSubmit={submit} className="space-y-3 mb-4">
          <p className="text-xs font-medium text-bronze/60">{editingId ? 'Editing listing' : 'New listing'}</p>
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <textarea required placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <input placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <input placeholder="Google Maps link (optional)" value={form.map_link} onChange={(e) => setForm({ ...form, map_link: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <div>
            <label className="text-sm font-medium block mb-1">Photos</label>
            <input type="file" accept="image/*" multiple onChange={onPhotosSelected} className="text-sm" />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} className="w-14 h-14 object-cover rounded-md border border-bronze/20" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-white rounded-full w-4 h-4 text-[10px] border border-bronze/20">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-4">{editingId ? 'Save Changes' : 'Add Listing'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-sm text-bronze/60">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-bronze/50">Loading listings…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-bronze/50">No listings under this service yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-fawn/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                {item.photos?.[0] && <img src={item.photos[0]} className="w-10 h-10 object-cover rounded" />}
                <span className="text-sm">{item.title}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="text-xs text-gold">Edit</button>
                <button onClick={() => remove(item.id)} className="text-xs text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyProperty = {
  title: '', location: '', price: '', property_type: 'apartment', description: '',
  bedrooms: '', bathrooms: '', area_sqft: '', status: 'available', featured: false,
  map_link: '', external_link: '',
};


function PropertiesPanel() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProperty);
  const [photos, setPhotos] = useState([]); // array of data-url/url strings
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => api.getProperties().then(setProperties).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const onPhotosSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const converted = await Promise.all(files.map((f) => compressImageFile(f)));
      setPhotos((prev) => [...prev, ...converted]);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyProperty);
    setPhotos([]);
    setShowForm(true);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title, location: p.location, price: p.price || '',
      property_type: p.property_type || 'apartment', description: p.description,
      bedrooms: p.bedrooms ?? '', bathrooms: p.bathrooms ?? '', area_sqft: p.area_sqft ?? '',
      status: p.status, featured: p.featured,
      map_link: p.map_link || '', external_link: p.external_link || '',
    });
    setPhotos(p.images || []);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      images: photos,
    };
    if (editingId) {
      await api.updateProperty(editingId, payload);
    } else {
      await api.createProperty(payload);
    }
    setForm(emptyProperty);
    setPhotos([]);
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const remove = async (id, title) => {
    const typed = prompt(
      `This will permanently delete "${title}" and mark any enquiries tied to it as closed.\n\nType DELETE to confirm.`
    );
    if (typed !== 'DELETE') return;
    await api.deleteProperty(id);
    load();
  };

  return (
    <div>
      <button onClick={() => (showForm ? setShowForm(false) : startCreate())} className="btn-primary text-sm py-2 px-4 mb-6">
        {showForm ? 'Close' : '+ Add Property'}
      </button>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} className="card space-y-3 mb-8">
          <p className="text-sm font-medium text-bronze/70">{editingId ? 'Editing property' : 'New property'}</p>
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
                {photos.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-16 h-16 object-cover rounded-md border border-bronze/20" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-white rounded-full w-5 h-5 text-xs border border-bronze/20">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Google Maps link (optional)" value={form.map_link} onChange={(e) => setForm({ ...form, map_link: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <input placeholder="Website/reference link (optional)" value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured listing
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-4">{editingId ? 'Save Changes' : 'Add Property'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-sm text-bronze/60">Cancel</button>
          </div>
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
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="btn-outline text-xs py-1.5 px-3">Edit</button>
                <button onClick={() => remove(p.id, p.title)} className="text-xs text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyTestimonial = { name: '', role: '', quote: '', rating: 5 };

function TestimonialsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTestimonial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.listAllTestimonials().then(setItems).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.createTestimonial({ ...form, rating: Number(form.rating) });
    setForm(emptyTestimonial);
    setShowForm(false);
    load();
  };

  const approve = async (t) => {
    await api.updateTestimonial(t.id, { approved: true });
    load();
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await api.updateTestimonial(editing.id, {
      name: editing.name,
      role: editing.role,
      quote: editing.quote,
      rating: Number(editing.rating),
    });
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await api.deleteTestimonial(id);
    load();
  };

  const pending = items.filter((t) => !t.approved);
  const approved = items.filter((t) => t.approved);

  const renderItem = (t) => (
    <div key={t.id} className="card">
      {editing?.id === t.id ? (
        <form onSubmit={saveEdit} className="space-y-2">
          <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <input value={editing.role || ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Role/context" className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <textarea value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} rows={2} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <select value={editing.rating || 5} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm">
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r === 1 ? '' : 's'}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-4">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-bronze/60">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-sm italic text-bronze/80">"{t.quote}"</p>
            <p className="text-xs font-semibold mt-2">{t.name} {t.role && `· ${t.role}`}</p>
            {t.rating && <p className="text-gold text-xs mt-1">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            {!t.approved && <button onClick={() => approve(t)} className="btn-outline text-xs py-1.5 px-3">Approve</button>}
            <button onClick={() => setEditing(t)} className="btn-outline text-xs py-1.5 px-3">Edit</button>
            <button onClick={() => remove(t.id)} className="text-xs text-red-600">Delete</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 mb-6">
        {showForm ? 'Close' : '+ Add Testimonial'}
      </button>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} className="card space-y-3 mb-8">
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
            <input placeholder="Role/context (optional, e.g. Homeowner, Vellore)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          </div>
          <textarea required placeholder="Quote" rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm" />
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm">
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r === 1 ? '' : 's'}</option>)}
          </select>
          <button type="submit" className="btn-primary text-sm py-2 px-4">Add Testimonial</button>
        </motion.form>
      )}

      {loading ? (
        <p className="text-bronze/60">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-bronze/60">No testimonials yet.</p>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3">Pending review ({pending.length})</h3>
              <div className="space-y-3">{pending.map(renderItem)}</div>
            </div>
          )}
          <div>
            <h3 className="font-serif text-lg mb-3">Live on site ({approved.length})</h3>
            {approved.length === 0 ? (
              <p className="text-sm text-bronze/60">Nothing approved yet.</p>
            ) : (
              <div className="space-y-3">{approved.map(renderItem)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
