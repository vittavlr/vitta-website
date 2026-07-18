import { motion } from 'framer-motion';
import { usePageMeta } from '../usePageMeta';

export default function About() {
  usePageMeta('About Us', 'VITTA brings real estate, finance, insurance, mutual funds, legal counsel and college admissions guidance under one trusted advisor.');
  return (
    <div className="section">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-3">
        About Us
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-4xl md:text-5xl max-w-2xl mb-8"
      >
        Guided decisions, built on trust.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-2xl text-bronze/80 leading-relaxed mb-6"
      >
        VITTA was founded on a simple idea: the biggest decisions in life — where to live, how to
        invest, how to protect your family, where your children study — deserve one trusted advisor
        rather than a dozen disconnected ones. We bring real estate, finance, insurance, mutual
        funds, legal counsel, and college admissions guidance under a single roof.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl text-bronze/80 leading-relaxed"
      >
        Every engagement starts with listening. We take the time to understand your goals and
        constraints before recommending a path forward — and we stay involved until the decision is
        made and the paperwork is done.
      </motion.p>

      <div className="grid sm:grid-cols-3 gap-6 mt-16">
        {['Trust', 'Transparency', 'Commitment'].map((v, i) => (
          <motion.div
            key={v}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <h3 className="font-serif text-2xl text-gold mb-2">{v}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
