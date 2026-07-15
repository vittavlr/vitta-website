import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setService(null);
    setError(false);
    api.getService(slug).then(setService).catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="section text-center">
        <p className="text-bronze/70 mb-4">We couldn't find that service.</p>
        <Link to="/services" className="text-gold hover:underline">← Back to services</Link>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {service && (
        <motion.div
          key={slug}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="section"
        >
          <Link to="/services" className="text-sm text-gold hover:underline">← All services</Link>
          <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-6">{service.title}</h1>
          <p className="text-lg text-bronze/70 mb-8 max-w-2xl">{service.short_description}</p>
          <div className="card max-w-3xl">
            <p className="leading-relaxed text-bronze/80">{service.full_description}</p>
          </div>
          <div className="mt-10">
            <Link to="/contact" className="btn-primary">Enquire about {service.title} →</Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
