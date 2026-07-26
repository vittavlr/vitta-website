import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQAccordion({ faqs, title = 'Frequently Asked Questions', className = 'mt-16 max-w-3xl', compact = false }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!faqs || faqs.length === 0) return null;
  const btnPad = compact ? 'px-4 py-2.5' : 'px-6 py-4';
  const ansPad = compact ? 'px-4 pb-2.5' : 'px-6 pb-4';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={className}>
      {title && <h2 className="font-serif text-2xl mb-6">{title}</h2>}
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {faqs.map((faq, i) => (
          <div key={i} className="card p-0 overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className={`w-full text-left ${btnPad} flex justify-between items-center gap-4`}
            >
              <span className={`font-medium ${textSize}`}>{faq.question}</span>
              <motion.span animate={{ rotate: openIdx === i ? 45 : 0 }} className="text-gold text-lg shrink-0">+</motion.span>
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className={`${ansPad} ${textSize} text-bronze/70`}>{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
