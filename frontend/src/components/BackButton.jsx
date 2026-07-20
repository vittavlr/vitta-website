import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = '' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`text-sm text-gold hover:underline w-fit ${className}`}
    >
      ← Back
    </button>
  );
}
