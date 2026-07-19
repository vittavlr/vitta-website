import { useState } from 'react';

export default function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className="text-2xl leading-none transition-transform hover:scale-110"
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
        >
          <span className={(hover || value) >= n ? 'text-gold' : 'text-bronze/25'}>★</span>
        </button>
      ))}
    </div>
  );
}
