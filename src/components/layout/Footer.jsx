import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/products';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <div className="footer__logo">
                <span className="footer__logo-mark">ASE</span>
                <div>
                  <span className="footer__logo-name">Art Supply Exchange</span>
                  <span className="footer__logo-tagline">India's creative circular marketplace</span>
                </div>
              </div>
              <p className="footer__mission">
                Buy less. Waste less.<br />Create more. Pass it forward.
              </p>
              <div className="footer__sustainability-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 8v4l3 3"/></svg>
                Circular economy for art
              </div>
            </div>

            {/* Marketplace */}
            <div className="footer__col">
              <h4 className="footer__col-title">Marketplace</h4>
              <ul className="footer__links">
                <li><Link to="/marketplace">Browse All</Link></li>
                <li><Link to="/dashboard">Sell a Material</Link></li>
                <li><Link to="/swaps">Swap Requests</Link></li>
                <li><Link to="/chat">Messages</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="footer__col">
              <h4 className="footer__col-title">Categories</h4>
              <ul className="footer__links">
                {CATEGORIES.slice(0, 6).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/marketplace?category=${cat.id}`}>{cat.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cities */}
            <div className="footer__col">
              <h4 className="footer__col-title">Cities</h4>
              <ul className="footer__links">
                {['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur'].map(city => (
                  <li key={city}>
                    <Link to={`/marketplace?city=${city}`}>{city}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <span className="footer__copy">© 2026 Art Supply Exchange. Made for artists, by artists.</span>
            <div className="footer__bottom-links">
              <span className="footer__catalog-num">ASE/2026/v1</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
