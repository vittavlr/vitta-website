import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import ThemedIllustration from '../components/ThemedIllustration';
import { SkeletonGrid } from '../components/Skeleton';
import { usePageMeta } from '../usePageMeta';
import { api } from '../api';

const values = [
  { name: 'Trust', kind: 'trust', text: 'Every recommendation is grounded in verified facts, not sales targets.' },
  { name: 'Transparency', kind: 'transparency', text: 'Clear fees, clear timelines, and honest answers — always.' },
  { name: 'Commitment', kind: 'commitment', text: 'We stay with you through the decision, not just the deal.' },
];

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
function numberWord(n) {
  return NUMBER_WORDS[n] || String(n);
}

export default function Home() {
  usePageMeta(
    'Real Estate, Finance & Legal Advisory',
    'One-stop advisory for real estate, finance, insurance, mutual funds, legal counsel and college admissions — thoughtfully guided from Vellore.'
  );
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {}).finally(() => setServicesLoading(false));
    api.getTestimonials().then(setTestimonials).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-br from-goldlight/40 via-fawn to-bronze/25"
        >
          <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full text-bronze/15" fill="currentColor">
            <rect x="40" y="120" width="60" height="180" />
            <rect x="110" y="80" width="70" height="220" />
            <rect x="190" y="150" width="50" height="150" />
            <rect x="600" y="100" width="65" height="200" />
            <rect x="675" y="140" width="55" height="160" />
            <rect x="500" y="60" width="80" height="240" />
            <polygon points="350,300 400,40 450,300" />
          </svg>
        </motion.div>
        <div className="absolute inset-0 bg-linen/80" />
        <div className="relative section pt-24 pb-32">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="eyebrow mb-4">
            Building Trust · Delivering Value
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="font-serif text-5xl md:text-7xl leading-[1.05] mb-2"
          >
            Your Dream.
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="font-serif italic text-5xl md:text-7xl text-gold leading-[1.05] mb-8"
          >
            Our Commitment.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="max-w-xl text-bronze/80 mb-10"
          >
            One-stop advisory for real estate, finance, insurance, mutual funds, legal counsel and
            college admissions — thoughtfully guided, every step of the way.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-wrap gap-4">
            <Link to="/services" className="btn-primary">Explore services →</Link>
          </motion.div>
        </div>
      </section>

      {/* About / Values */}
      <section className="section">
        <p className="eyebrow mb-3">About VITTA</p>
        <h2 className="font-serif text-3xl md:text-4xl max-w-2xl mb-10">
          A trusted partner for life's biggest decisions.
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(74,68,51,0.08)]"
            >
              <ThemedIllustration kind={v.kind} className="h-28 w-full" />
              <div className="p-6">
                <h3 className="font-serif text-2xl text-gold mb-2">{v.name}</h3>
                <p className="text-sm text-bronze/70">{v.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-fawn/60">
        <div className="section">
          <p className="eyebrow mb-3">What we do</p>
          <h2 className="font-serif text-3xl md:text-4xl max-w-2xl mb-12">
            {numberWord(services.length)} service{services.length === 1 ? '' : 's'}, one advisor.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesLoading ? (
              <SkeletonGrid count={3} />
            ) : (
              services.map((s) => <ServiceCard key={s.id} service={s} />)
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section">
          <p className="eyebrow mb-3 text-center">What Clients Say</p>
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Trusted by families across Vellore.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                {t.rating && (
                  <div className="text-gold mb-3">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                )}
                <p className="text-bronze/80 italic mb-4">"{t.quote}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
                {t.role && <p className="text-xs text-bronze/50">{t.role}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
