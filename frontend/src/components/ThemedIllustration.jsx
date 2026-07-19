// Fully local, always-renders illustrations for services/values — replaces
// the earlier Unsplash-keyword approach, which depended on an external
// service and could show as broken/empty. These are inline SVG icons on a
// brand-colored gradient, so they never fail to load and never look empty.

const ICONS = {
  'real-estate': (
    <path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6M9 12h.01M15 12h.01" strokeLinecap="round" strokeLinejoin="round" />
  ),
  finance: (
    <path d="M3 3v18h18M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  insurance: (
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'mutual-funds': (
    <path d="M3 17l5-5 4 4 8-9M20 7h-4v4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'legal-counsel': (
    <path d="M12 3v18M5 8l-3 6a3 3 0 006 0l-3-6zM19 8l-3 6a3 3 0 006 0l-3-6zM5 8h6M13 8h6M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'college-admissions': (
    <path d="M2 9l10-5 10 5-10 5-10-5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  default: (
    <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.4L12 16.8l-6.3 4.4 2.3-7.4-6-4.4h7.6z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  trust: (
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  transparency: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 010 18" strokeLinecap="round" />
    </>
  ),
  commitment: (
    <path d="M12 21s-7-4.5-9.5-9C.5 8 2 4 6 4c2 0 4 1.3 6 4 2-2.7 4-4 6-4 4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export default function ThemedIllustration({ kind, className = '' }) {
  const path = ICONS[kind] || ICONS.default;
  return (
    <div className={`bg-gradient-to-br from-goldlight/50 via-fawn to-bronze/30 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-1/3 h-1/3 text-bronze/40">
        {path}
      </svg>
    </div>
  );
}
