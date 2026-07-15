import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProperties()
      .then(setProperties)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      {!loading && properties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-20"
        >
          <p className="eyebrow mb-4">— Coming Soon —</p>
          <h2 className="font-serif text-3xl mb-4">Fresh listings arriving shortly.</h2>
          <p className="text-bronze/70 max-w-md mx-auto mb-8">
            We're finalising verifications on a new set of homes and plots. Share your preferences
            with us and we'll notify you as soon as the right match is ready.
          </p>
          <Link to="/contact" className="btn-primary">Register your interest →</Link>
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
              className="card overflow-hidden p-0"
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
    </div>
  );
}
