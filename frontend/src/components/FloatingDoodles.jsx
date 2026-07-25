import { motion } from 'framer-motion';

const orb = (className, delay, duration) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ x: [0, 24, -16, 0], y: [0, -20, 14, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/** Ambient floating glow + doodle shapes for section backgrounds. Place
 * inside a `relative overflow-hidden` container; renders behind content. */
export default function FloatingDoodles({ variant = 'default' }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orb('w-72 h-72 bg-gold/20 -top-10 -left-10', 0, 10)}
      {orb('w-56 h-56 bg-goldlight/25 top-1/3 right-0', 1.5, 12)}
      {orb('w-40 h-40 bg-bronze/10 bottom-0 left-1/4', 0.8, 9)}

      {variant === 'default' && (
        <>
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute top-10 right-10 w-16 h-16 text-gold/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
          </motion.svg>
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute bottom-16 left-16 w-10 h-10 text-bronze/20"
            animate={{ y: [0, -14, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          </motion.svg>
          <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gold/40"
            animate={{ y: [0, -30, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  );
}
