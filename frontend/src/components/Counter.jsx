import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function Counter({ to, suffix = '', duration = 1.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setValue(Math.round(progress * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);

  return (
    <motion.span ref={ref} className="font-serif text-4xl text-gold">
      {value}{suffix}
    </motion.span>
  );
}
