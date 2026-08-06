import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThemedIllustration from '../components/ThemedIllustration';
import FAQAccordion from '../components/FAQAccordion';
import AnnouncementsPopup from '../components/AnnouncementsPopup';
import Counter from '../components/Counter';
import FloatingDoodles from '../components/FloatingDoodles';
import { usePageMeta } from '../usePageMeta';
import { api } from '../api';
import { getRecentlyViewed } from '../localStore';

const values = [
  { name: 'Trust', kind: 'trust', text: 'Every recommendation is grounded in verified facts, not sales targets.' },
  { name: 'Transparency', kind: 'transparency', text: 'Clear fees, clear timelines, and honest answers — always.' },
  { name: 'Commitment', kind: 'commitment', text: 'We stay with you through the decision, not just the deal.' },
];

const process = [
  { step: '1', title: 'Tell us your need', text: 'Share your goal — buying a home, planning finances, or anything in between.', kind: 'transparency' },
  { step: '2', title: 'We assess & advise', text: 'Our team reviews your situation and lays out clear, honest options.', kind: 'trust' },
  { step: '3', title: 'We stay with you', text: 'From paperwork to closing, we walk the whole journey alongside you.', kind: 'commitment' },
];

export default function Home() {
  usePageMeta(
    'Real Estate, Finance & Legal Advisory',
    'One-stop advisory for real estate, finance, insurance, mutual funds, legal counsel and college admissions — thoughtfully guided from Vellore.'
  );
  const [testimonials, setTestimonials] = useState([]);
  const [serviceCount, setServiceCount] = useState(6);
  const [propertyCount, setPropertyCount] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(getRecentlyViewed());
    api.getTestimonials().then(setTestimonials).catch(() => {});
    api.getServices().then((s) => setServiceCount(s.length)).catch(() => {});
    api.getProperties().then((p) => {
      setPropertyCount(p.length);
      setFeaturedProperties((p.filter((x) => x.featured).length > 0 ? p.filter((x) => x.featured) : p).slice(0, 3));
    }).catch(() => {});
  }, []);

  const generalFaqs = [
    { question: 'Is the first consultation free?', answer: 'Yes, always free with no obligation.' },
    { question: 'How quickly will I hear back?', answer: 'Within 24 hours, usually sooner.' },
    { question: 'Which areas do you serve?', answer: 'Vellore and nearby areas.' },
    { question: 'Do I need to visit the office?', answer: 'No, phone or WhatsApp works fine.' },
    { question: 'Is there a fee to enquire?', answer: 'No, enquiries are always free.' },
  ];

  return (
    <div>
      <AnnouncementsPopup />
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

      {/* Stats strip */}
      <section className="relative overflow-hidden">
        <FloatingDoodles />
        <div className="relative z-10 section py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <Counter to={serviceCount} />
            <p className="text-xs text-bronze/60 mt-1 uppercase tracking-wide">Services offered</p>
          </div>
          <div>
            <Counter to={propertyCount} suffix="+" />
            <p className="text-xs text-bronze/60 mt-1 uppercase tracking-wide">Active listings</p>
          </div>
          <div>
            <Counter to={testimonials.length} suffix="+" />
            <p className="text-xs text-bronze/60 mt-1 uppercase tracking-wide">Client reviews</p>
          </div>
          <div>
            <Counter to={24} suffix="h" />
            <p className="text-xs text-bronze/60 mt-1 uppercase tracking-wide">Response time</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div>
        <p className="eyebrow mb-3 text-center">How It Works</p>
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Three steps, start to finish.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {process.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glow-hover rounded-2xl overflow-hidden border border-fawn/40 bg-fawn/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(74,68,51,0.08)]"
            >
              <ThemedIllustration kind={p.kind} className="h-24 w-full" />
              <div className="p-6">
                <span className="text-gold font-serif text-2xl">{p.step}</span>
                <h3 className="font-serif text-xl mt-1 mb-2">{p.title}</h3>
                <p className="text-sm text-bronze/70">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* Why VITTA */}
      <section className="section">
        <p className="eyebrow mb-3 text-center">Why VITTA</p>
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">More than an advisor.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Verified, always', text: 'Every property, every document, checked before it reaches you.', kind: 'trust' },
            { title: 'One point of contact', text: 'No juggling five different agents — one advisor, every service.', kind: 'commitment' },
            { title: 'Local expertise', text: 'Deep roots in Vellore mean we know the market, not just the listings.', kind: 'real-estate' },
            { title: 'No hidden fees', text: 'What we quote is what you pay — nothing buried in the fine print.', kind: 'transparency' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="glow-hover rounded-2xl border border-fawn/40 bg-fawn/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(74,68,51,0.08)]"
            >
              <ThemedIllustration kind={f.kind} className="h-16 w-16 rounded-full mb-4" />
              <h3 className="font-serif text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-bronze/70">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      {recent.length > 0 && (
        <section className="section py-6">
          <p className="text-xs text-bronze/50 mb-3 uppercase tracking-wide">Recently viewed</p>
          <div className="flex gap-3 flex-wrap">
            {recent.map((r, i) => (
              <Link key={i} to={r.link} className="text-xs bg-fawn/30 backdrop-blur-md border border-fawn/40 rounded-full px-4 py-2 hover:text-gold">
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="section">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="eyebrow mb-3">Featured</p>
              <h2 className="font-serif text-3xl md:text-4xl">Homes worth a look.</h2>
            </div>
            <Link to="/listings" className="text-gold text-sm font-semibold hover:underline hidden sm:block">
              View all listings →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/listings" className="glow-hover block rounded-2xl overflow-hidden border border-fawn/40 bg-fawn/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(74,68,51,0.08)]">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover" />}
                  <div className="p-5">
                    <h3 className="font-serif text-lg mb-1">{p.title}</h3>
                    <p className="text-xs text-bronze/60 mb-2">{p.location}</p>
                    {p.price && <p className="text-gold font-semibold text-sm">{p.price}</p>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/listings" className="text-gold text-sm font-semibold hover:underline">View all listings →</Link>
          </div>
        </section>
      )}

      {/* About */}
      <section className="section">
        <p className="eyebrow mb-3">About VITTA</p>
        <h2 className="font-serif text-3xl md:text-4xl max-w-2xl mb-8">
          Guided decisions, built on trust.
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl text-bronze/80 leading-relaxed mb-6"
        >
          VITTA was founded on a simple idea: the biggest decisions in life — where to live, how to
          invest, how to protect your family, where your children study — deserve one trusted advisor
          rather than a dozen disconnected ones. We bring real estate, finance, insurance, mutual
          funds, legal counsel, and college admissions guidance under a single roof.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl text-bronze/80 leading-relaxed mb-12"
        >
          Every engagement starts with listening. We take the time to understand your goals and
          constraints before recommending a path forward — and we stay involved until the decision is
          made and the paperwork is done.
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl overflow-hidden border border-fawn/40 bg-fawn/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(74,68,51,0.08)]"
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
                className="card glow-hover"
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

      {/* General FAQ */}
      <section className="section py-10">
        <h2 className="font-serif text-2xl text-center mb-4">Good to know.</h2>
        <FAQAccordion faqs={generalFaqs} title={null} className="max-w-lg mx-auto" compact />
      </section>
    </div>
  );
}
