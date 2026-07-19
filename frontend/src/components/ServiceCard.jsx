import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThemedIllustration from './ThemedIllustration';

export default function ServiceCard({ service }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className="rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(74,68,51,0.08)] hover:shadow-[0_8px_40px_rgba(74,68,51,0.14)] transition-shadow duration-300 flex flex-col h-full"
    >
      <div className="relative h-36 overflow-hidden shrink-0">
        {service.image ? (
          <img src={service.image} alt={service.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <ThemedIllustration kind={service.slug} className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-linen/20" />
      </div>

      <div className="flex flex-col flex-1 p-8">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-serif text-xl mb-6 -mt-14 relative z-10 bg-white/90 backdrop-blur-md border border-white/50">
          {service.title.charAt(0)}
        </div>
        <h3 className="font-serif text-2xl mb-3">{service.title}</h3>
        <p className="text-bronze/70 text-sm mb-6 flex-1">{service.short_description}</p>
        <Link to={`/services/${service.slug}`} className="text-gold text-sm font-semibold hover:underline">
          Learn more →
        </Link>
      </div>
    </motion.div>
  );
}
