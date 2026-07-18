import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';

export default function WhatsAppButton() {
  const [phone, setPhone] = useState(null);

  useEffect(() => {
    api.getPublicContact().then((c) => setPhone(c.phone)).catch(() => {});
  }, []);

  if (!phone) return null;

  const digits = phone.replace(/\D/g, '');
  const waLink = `https://wa.me/${digits}?text=${encodeURIComponent('Hi VITTA, I have a question.')}`;

  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white text-2xl"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      💬
    </motion.a>
  );
}
