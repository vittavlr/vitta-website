import { useEffect, useState } from 'react';
import { api } from '../api';
import { compressImageFile } from '../imageUtils';

export default function ProfileEditor() {
  const [form, setForm] = useState({ title: '', bio: '', photo: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicContact().then((c) => {
      setForm({ title: c.title || '', bio: c.bio || '', photo: c.photo || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file, 400);
    setForm({ ...form, photo: dataUrl });
  };

  const submit = async (e) => {
    e.preventDefault();
    await api.updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return null;

  return (
    <div className="card max-w-lg mt-6">
      <h3 className="font-serif text-2xl mb-1">Public Profile</h3>
      <p className="text-sm text-bronze/60 mb-6">
        Shown on the public Contact page — your title, a short bio, and a photo.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            placeholder="e.g. Founder & Principal Advisor"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            rows={4}
            placeholder="A short introduction customers will see on the Contact page"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1 w-full rounded-lg border border-bronze/20 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Photo</label>
          <input type="file" accept="image/*" onChange={onPhoto} className="text-sm" />
          {form.photo && (
            <div className="flex items-center gap-3 mt-2">
              <img src={form.photo} alt="" className="w-16 h-16 rounded-full object-cover border border-bronze/20" />
              <button type="button" onClick={() => setForm({ ...form, photo: '' })} className="text-xs text-red-600">Remove photo</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary text-sm py-2 px-4">Save Profile</button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm('Clear title, bio, and photo from the public Contact page?')) return;
              const cleared = { title: '', bio: '', photo: '' };
              await api.updateProfile(cleared);
              setForm(cleared);
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
            className="text-xs text-red-600"
          >
            Clear entire profile
          </button>
          {saved && <span className="text-xs text-green-700">✓ Saved</span>}
        </div>
      </form>
    </div>
  );
}
