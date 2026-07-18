import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import { SkeletonGrid } from '../components/Skeleton';
import { api } from '../api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getServices()
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-3">
        What We Do
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-4xl md:text-5xl max-w-2xl mb-12"
      >
        Advisory across every major life decision.
      </motion.h1>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
