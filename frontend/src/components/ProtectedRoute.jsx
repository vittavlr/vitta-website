import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireOwner = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="section text-center">Loading…</div>;
  if (!user) return <Navigate to="/vitta-private" replace />;
  if (requireOwner && user.role !== 'owner') return <Navigate to="/vitta-private/admin" replace />;

  return children;
}
