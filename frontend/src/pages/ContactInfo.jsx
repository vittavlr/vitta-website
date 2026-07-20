import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { usePageMeta } from '../usePageMeta';
import BackButton from '../components/BackButton';

export default function ContactInfo() {
  usePageMeta('Contact', 'Reach VITTA by phone, email, or visit our office in Vellore.');
  const [contact, setContact] = useState({});

  useEffect(() => {
    api.getPublicContact().then(setContact).catch(() => {});
  }, []);

  return (
    <div className="section max-w-3xl">
      <BackButton className="mb-6" />
      <p className="eyebrow mb-3">Contact</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Get in touch.</h1>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="card flex items-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-2xl">📞</span>
            <div>
              <p className="text-xs text-bronze/50 uppercase tracking-wide">Call us</p>
              <p className="font-serif text-lg">{contact.phone}</p>
            </div>
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="card flex items-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-2xl">✉️</span>
            <div>
              <p className="text-xs text-bronze/50 uppercase tracking-wide">Email us</p>
              <p className="font-serif text-lg break-all">{contact.email}</p>
            </div>
          </a>
        )}
      </div>

      {contact.bio && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card mb-10">
          <div className="flex items-center gap-4 mb-4">
            {contact.photo && (
              <img src={contact.photo} alt={contact.name} className="w-16 h-16 rounded-full object-cover border border-white/50" />
            )}
            <div>
              <p className="font-serif text-xl">{contact.name}</p>
              {contact.title && <p className="text-sm text-gold">{contact.title}</p>}
            </div>
          </div>
          <p className="text-bronze/80 leading-relaxed">{contact.bio}</p>
        </motion.div>
      )}

      <div className="rounded-2xl overflow-hidden border border-bronze/10 h-72 mb-4">
        <iframe
          title="VITTA office location"
          src="https://www.google.com/maps?q=12.860966,79.132826&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className="text-sm text-bronze/60 mb-10">Vellore, Tamil Nadu, India</p>

      <div className="text-center">
        <Link to="/enquire" className="btn-primary">Send us an inquiry →</Link>
      </div>
    </div>
  );
}
