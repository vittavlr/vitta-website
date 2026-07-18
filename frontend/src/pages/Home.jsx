import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { api } from '../api';

const values = ['Trust', 'Transparency', 'Commitment'];

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
function numberWord(n) {
  return NUMBER_WORDS[n] || String(n);
}

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut' }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"
        />
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
              key={v}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card"
            >
              <h3 className="font-serif text-2xl text-gold mb-2">{v}</h3>
              <p className="text-sm text-bronze/70">
                {v === 'Trust' && 'Every recommendation is grounded in verified facts, not sales targets.'}
                {v === 'Transparency' && 'Clear fees, clear timelines, and honest answers — always.'}
                {v === 'Commitment' && 'We stay with you through the decision, not just the deal.'}
              </p>
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
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
