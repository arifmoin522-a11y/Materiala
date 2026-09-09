import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="Art Supply Exchange — Home">
          <span className="navbar__logo-mark">ASE</span>
          <span className="navbar__logo-text">Art Supply<br/>Exchange</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links hide-mobile" aria-label="Main navigation">
          <NavLink to="/marketplace" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Marketplace</NavLink>
          <NavLink to="/dashboard"   className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Sell</NavLink>
          <NavLink to="/swaps"       className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Swap</NavLink>
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <Link to="/marketplace" className="navbar__search-btn hide-mobile" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </Link>

          {currentUser ? (
            <div className="navbar__profile">
              <button
                className="navbar__avatar-btn"
                onClick={() => setProfileOpen(o => !o)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="navbar__avatar" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {profileOpen && (
                <div className="navbar__dropdown" role="menu">
                  <div className="navbar__dropdown-header">
                    <span className="navbar__dropdown-name">{currentUser.name}</span>
                    <span className="navbar__dropdown-city">{currentUser.city}</span>
                  </div>
                  <Link to="/dashboard" className="navbar__dropdown-item" role="menuitem">Dashboard</Link>
                  <Link to="/chat" className="navbar__dropdown-item" role="menuitem">Messages</Link>
                  <Link to="/swaps" className="navbar__dropdown-item" role="menuitem">Swap Requests</Link>
                  {currentUser.isAdmin && (
                    <Link to="/admin" className="navbar__dropdown-item navbar__dropdown-item--admin" role="menuitem">Admin Panel</Link>
                  )}
                  <button className="navbar__dropdown-item navbar__dropdown-item--logout" onClick={handleLogout} role="menuitem">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="navbar__cta">Sign In</Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger hide-desktop"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="navbar__drawer-links">
          <Link to="/marketplace" className="drawer-link">Marketplace</Link>
          <Link to="/swaps" className="drawer-link">Swap</Link>
          <Link to="/chat" className="drawer-link">Messages</Link>
          {currentUser ? (
            <>
              <Link to="/dashboard" className="drawer-link">Dashboard</Link>
              {currentUser.isAdmin && <Link to="/admin" className="drawer-link">Admin</Link>}
              <button className="drawer-link drawer-link--logout" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <Link to="/auth" className="drawer-link drawer-link--cta">Sign In / Register</Link>
          )}
        </nav>
      </div>

      {menuOpen && <div className="navbar__backdrop" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
