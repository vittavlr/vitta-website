import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Listings from './pages/Listings';
import Contact from './pages/Contact';
import Login from './pages/Login';
import RecoveryReset from './pages/RecoveryReset';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isPrivate = location.pathname.startsWith('/vitta-private');

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/services/:slug" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
        <Route path="/listings" element={<PublicLayout><Listings /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Private area — secret URL prefix, no public nav links */}
        <Route path="/vitta-private" element={<Login />} />
        <Route path="/vitta-private/recovery" element={<RecoveryReset />} />
        <Route
          path="/vitta-private/owner"
          element={
            <ProtectedRoute requireOwner>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vitta-private/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <PublicLayout>
              <div className="section text-center">
                <h1 className="font-serif text-4xl mb-4">Page not found</h1>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
