import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQAccordion({ faqs, title = 'Frequently Asked Questions', className = 'mt-16 max-w-3xl' }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className={className}>
      {title && <h2 className="font-serif text-2xl mb-6">{title}</h2>}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="card p-0 overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full text-left px-6 py-4 flex justify-between items-center gap-4"
            >
              <span className="font-medium text-sm">{faq.question}</span>
              <motion.span animate={{ rotate: openIdx === i ? 45 : 0 }} className="text-gold text-xl shrink-0">+</motion.span>
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 text-sm text-bronze/70">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
