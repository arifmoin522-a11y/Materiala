import { useLocation, BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/ui/Toast';

// Pages
import Home          from './pages/Home';
import Auth          from './pages/Auth';
import Marketplace   from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Dashboard     from './pages/Dashboard';
import Chat          from './pages/Chat';
import SwapRequests  from './pages/SwapRequests';
import AdminPanel    from './pages/AdminPanel';
import SellerProfile from './pages/SellerProfile';

// Global styles
import './styles/global.css';

// Routes where footer is hidden
const NO_FOOTER = ['/chat', '/auth'];

function AppShell() {
  const location = useLocation();
  const showFooter = !NO_FOOTER.includes(location.pathname);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/auth"        element={<Auth />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/chat"        element={<Chat />} />
        <Route path="/swaps"       element={<SwapRequests />} />
        <Route path="/admin"       element={<AdminPanel />} />
        <Route path="/seller/:id"  element={<SellerProfile />} />
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '160px 24px 80px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '16px' }}>
              404 — Page Not Found
            </h1>
            <Link to="/" style={{ color: 'var(--color-terracotta)', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)' }}>
              Return Home →
            </Link>
          </div>
        } />
      </Routes>
      {showFooter && <Footer />}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
