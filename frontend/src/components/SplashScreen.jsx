import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'vitta_splash_shown';

export default function SplashScreen({ children }) {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem(SESSION_KEY));

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setShowSplash(false);
    }, 8500);
    return () => clearTimeout(timer);
  }, [showSplash]);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          >
            <video
              className="w-full h-full object-cover"
              src="./video/loading.mp4"
              autoPlay
              muted
              playsInline
              onEnded={() => {
                sessionStorage.setItem(SESSION_KEY, 'true');
                setShowSplash(false);
              }}
            />
            <button
              onClick={() => {
                sessionStorage.setItem(SESSION_KEY, 'true');
                setShowSplash(false);
              }}
              className="absolute top-5 right-5 text-white/90 text-sm font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 transition-colors"
            >
              Skip →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!showSplash && children}
    </>
  );
}
