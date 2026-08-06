import { useEffect, useState } from 'react';

export default function DarkModeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => localStorage.getItem('vitta_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('vitta_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-8 h-8 rounded-full border border-bronze/20 flex items-center justify-center text-sm ${className}`}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
