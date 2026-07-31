import { Link } from 'react-router-dom';

export default function Breadcrumbs({ trail }) {
  return (
    <nav className="text-xs text-bronze/50 mb-4 flex flex-wrap gap-1 items-center">
      {trail.map((t, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span>/</span>}
          {t.to ? <Link to={t.to} className="hover:text-gold">{t.label}</Link> : <span className="text-bronze/70">{t.label}</span>}
        </span>
      ))}
    </nav>
  );
}
