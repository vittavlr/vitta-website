import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { SkeletonGrid } from '../components/Skeleton';
import { usePageMeta } from '../usePageMeta';
import { buildMapUrls } from '../mapUtils';

export default function Listings() {
  usePageMeta('Property Listings', 'Personally verified homes and investments — title, encumbrance, valuation and access all checked.');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getProperties()
      .then(setProperties)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openProperty = (p) => {
    setSelected(p);
    setActiveImage(0);
    setZoomed(false);
  };

  const enquireAbout = (p) => {
    const params = new URLSearchParams({
      property: p.title,
      property_id: p.id,
      property_location: p.location || '',
      property_price: p.price || '',
      service: 'Real Estate',
    });
    navigate(`/enquire?${params.toString()}`);
  };

  return (
    <div className="section">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-3">
        Listings
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-4xl md:text-5xl max-w-2xl mb-6"
      >
        Curated homes &amp; investments.
      </motion.h1>
      <p className="text-bronze/70 max-w-2xl mb-16">
        Every listing on VITTA is personally verified — title, encumbrance, valuation and access.
        When you're ready, we walk it with you.
      </p>

      {loading && <SkeletonGrid count={3} />}

      {!loading && properties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-20"
        >
          <p className="eyebrow mb-4">— Coming Soon —</p>
          <h2 className="font-serif text-3xl mb-4">Fresh listings arriving shortly.</h2>
          <p className="text-bronze/70 max-w-md mx-auto">
            We're finalising verifications on a new set of homes and plots. Check back soon, or use
            the Enquire button above to share your preferences.
          </p>
        </motion.div>
      )}

      {properties.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => openProperty(p)}
              className="card overflow-hidden p-0 cursor-pointer"
            >
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="font-serif text-xl mb-1">{p.title}</h3>
                <p className="text-sm text-bronze/60 mb-3">{p.location}</p>
                {p.price && <p className="text-gold font-semibold mb-3">{p.price}</p>}
                <p className="text-sm text-bronze/70 line-clamp-3">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Property detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-linen rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print-area"
            >
              {selected.images?.length > 0 && (
                <div className="relative overflow-hidden bg-black">
                  <motion.img
                    src={selected.images[activeImage]}
                    alt={selected.title}
                    onClick={() => setZoomed(!zoomed)}
                    animate={{ scale: zoomed ? 2 : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full h-72 object-cover ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  />
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
                    {zoomed ? 'Click to zoom out' : 'Click to zoom in'}
                  </span>
                  {selected.images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto bg-white/50">
                      {selected.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          onClick={() => { setActiveImage(idx); setZoomed(false); }}
                          className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${
                            idx === activeImage ? 'border-gold' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-8">
                <button
                  onClick={() => setSelected(null)}
                  className="float-right text-bronze/50 hover:text-bronze text-xl leading-none"
                >
                  ✕
                </button>
                <h2 className="font-serif text-3xl mb-1">{selected.title}</h2>
                <p className="text-bronze/60 mb-3">{selected.location}</p>
                {selected.price && <p className="text-gold font-semibold text-lg mb-4">{selected.price}</p>}

                <div className="flex gap-6 text-sm text-bronze/70 mb-4">
                  {selected.bedrooms != null && <span>{selected.bedrooms} Bed</span>}
                  {selected.bathrooms != null && <span>{selected.bathrooms} Bath</span>}
                  {selected.area_sqft != null && <span>{selected.area_sqft} sqft</span>}
                  {selected.property_type && <span className="capitalize">{selected.property_type}</span>}
                </div>

                <p className="text-bronze/80 leading-relaxed mb-6">{selected.description}</p>

                {selected.map_link && (
                  <div className="rounded-xl overflow-hidden border border-bronze/10 h-40 mb-6">
                    <iframe
                      title={`${selected.title} location`}
                      src={buildMapUrls(selected.map_link).embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3 no-print">
                  <button onClick={() => enquireAbout(selected)} className="btn-primary">
                    Enquire about this property →
                  </button>
                  {selected.map_link && (
                    <a href={buildMapUrls(selected.map_link).viewUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                      📍 View on Map
                    </a>
                  )}
                  {selected.external_link && (
                    <a href={selected.external_link} target="_blank" rel="noopener noreferrer" className="btn-outline">
                      🔗 Visit Link
                    </a>
                  )}
                  <button onClick={() => window.print()} className="btn-outline">
                    🖨 Print
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
