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
      className="fixed bottom-24 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.522 1.804 6.377L4 29l7.812-1.766A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm6.98 16.98c-.297.837-1.47 1.53-2.404 1.72-.64.13-1.474.234-4.29-.917-3.6-1.49-5.92-5.15-6.1-5.39-.176-.24-1.46-1.94-1.46-3.7s.914-2.62 1.24-2.98c.297-.33.65-.41.867-.41.216 0 .434.002.624.012.2.01.468-.077.732.558.297.72 1.01 2.48 1.098 2.66.088.18.148.39.03.63-.12.24-.18.39-.36.6-.176.21-.37.47-.53.63-.176.176-.36.367-.155.72.206.352.914 1.51 1.964 2.446 1.35 1.204 2.49 1.578 2.84 1.755.352.176.556.147.762-.088.206-.235.882-1.03 1.117-1.383.235-.353.47-.294.79-.176.32.117 2.03.958 2.38 1.132.353.176.588.264.674.41.088.146.088.845-.208 1.68z" />
      </svg>
    </motion.a>
  );
}
