import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className="card flex flex-col h-full"
    >
      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-serif text-xl mb-6">
        {service.title.charAt(0)}
      </div>
      <h3 className="font-serif text-2xl mb-3">{service.title}</h3>
      <p className="text-bronze/70 text-sm mb-6 flex-1">{service.short_description}</p>
      <Link to={`/services/${service.slug}`} className="text-gold text-sm font-semibold hover:underline">
        Learn more →
      </Link>
    </motion.div>
  );
}
