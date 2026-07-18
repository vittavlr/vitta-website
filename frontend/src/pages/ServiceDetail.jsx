import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { serviceImageUrl } from '../serviceImages';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setService(null);
    setItems([]);
    setError(false);
    setImgFailed(false);
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Themed hero, same treatment as the homepage hero */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {!imgFailed ? (
              <motion.img
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: 'easeOut' }}
                src={serviceImageUrl(slug, 1600, 500)}
                alt={service.title}
                onError={() => setImgFailed(true)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-goldlight/40 to-bronze/20" />
            )}
            <div className="absolute inset-0 bg-linen/80" />
            <div className="relative section flex flex-col justify-end h-full pb-8">
              <Link to="/services" className="text-sm text-gold hover:underline mb-3 w-fit">← All services</Link>
              <h1 className="font-serif text-4xl md:text-5xl">{service.title}</h1>
            </div>
          </div>

          <div className="section pt-12">
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
                    <div key={item.id} className="rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(74,68,51,0.08)]">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
