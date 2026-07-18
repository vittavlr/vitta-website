import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    setService(null);
    setItems([]);
    setError(false);
    api.getService(slug).then(setService).catch(() => setError(true));
    api.getServiceItems(slug).then(setItems).catch(() => {});
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
            <Link
              to={`/contact?service=${encodeURIComponent(service.title)}`}
              className="btn-primary"
            >
              Enquire about {service.title} →
            </Link>
          </div>

          {items.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-2xl mb-6">Available under {service.title}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="card overflow-hidden p-0">
                    {item.photos?.[0] && (
                      <img src={item.photos[0]} alt={item.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-bronze/70 mb-3 line-clamp-3">{item.description}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gold text-sm font-semibold hover:underline">
                          Learn more →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
