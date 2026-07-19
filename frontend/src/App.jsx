import { useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';
import logo from './assets/logo.png';
import { api } from './api';

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
      <WhatsAppButton />
    </>
  );
}

function NotFound() {
  return (
    <div className="section text-center py-32">
      <motion.img
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        src={logo}
        alt="VITTA"
        className="h-16 w-16 mx-auto mb-6 opacity-70"
      />
      <h1 className="font-serif text-4xl mb-3">Page not found</h1>
      <p className="text-bronze/60 mb-8">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn-primary">← Back to homepage</Link>
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [location.pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    api.trackPageview(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
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

          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
