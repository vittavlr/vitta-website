import { Link, useLocation } from 'react-router-dom';

export default function MobileEnquireBar() {
  const location = useLocation();
  // Don't show it on the Enquire form itself, or on private/admin pages.
  if (location.pathname === '/enquire' || location.pathname.startsWith('/vitta-private')) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-linen/95 backdrop-blur border-t border-bronze/10 px-4 py-3">
      <Link
        to="/enquire"
        className="btn-primary w-full justify-center text-sm py-3"
      >
        Enquire Now →
      </Link>
    </div>
  );
}
