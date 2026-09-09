import { Link, useParams, useNavigate } from 'react-router-dom';
import { USERS } from '../data/users';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import { useScrollRevealAll } from '../hooks/useScrollReveal';
import './SellerProfile.css';

export default function SellerProfile() {
  const { id } = useParams();
  const { products, startConversation, showToast } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const seller = USERS.find(u => u.id === id);
  useScrollRevealAll();

  if (!seller) return (
    <div style={{ textAlign: 'center', padding: '160px 24px 80px' }}>
      <h2 className="heading" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--sp-4)' }}>Seller not found</h2>
      <Link to="/marketplace" className="btn btn--primary">Back to Marketplace</Link>
    </div>
  );

  const listings = products.filter(p => p.sellerId === id && p.status === 'available');
  const totalViews = listings.reduce((sum, p) => sum + (p.views || 0), 0) + (seller.totalSold * 45);

  const handleMessageSeller = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    const sampleProduct = listings[0];
    const convId = startConversation(
      seller.id,
      sampleProduct?.id || 'general',
      sampleProduct?.name || 'Studio Materials Discussion',
      currentUser.id
    );
    navigate(`/chat?conv=${convId}`);
    showToast(`Conversation started with ${seller.name}!`, 'success');
  };

  return (
    <div className="seller-profile page-enter">
      <div className="container">
        {/* Header */}
        <div className="seller-profile__header">
          <img src={seller.avatar} alt={seller.name} className="seller-profile__avatar" />
          <div className="seller-profile__info">
            <div className="seller-profile__eyebrow-row">
              <span className="catalog-num mono">ARTIST / {id.toUpperCase()}</span>
              <span className="seller-verified-badge mono">✓ Verified Art Trader</span>
            </div>
            <h1 className="seller-profile__name heading">{seller.name}</h1>
            {seller.bio && <p className="seller-profile__bio">{seller.bio}</p>}
            <div className="seller-profile__meta">
              <span className="seller-profile__meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {seller.city}
              </span>
              {seller.rating && (
                <span className="seller-profile__meta-item">★ {seller.rating} rating</span>
              )}
              <span className="seller-profile__meta-item mono">
                {seller.totalListings} listings · {seller.totalSold} sold
              </span>
              <span className="seller-profile__meta-item mono">
                Member since {seller.joinedAt}
              </span>
            </div>

            {/* Quick Action Button */}
            {currentUser?.id !== seller.id && (
              <div style={{ marginTop: 'var(--sp-4)' }}>
                <Button variant="terracotta" size="sm" onClick={handleMessageSeller}>
                  💬 Message {seller.name.split(' ')[0]}
                </Button>
              </div>
            )}
          </div>

          {/* Seller Credibility / Analytics Scorecard */}
          <div className="seller-analytics-badge">
            <span className="seller-analytics-title mono">COMMUNITY CREDIBILITY</span>
            <div className="seller-analytics-grid">
              <div className="seller-stat-mini">
                <span className="seller-stat-mini__val mono">{totalViews}</span>
                <span className="seller-stat-mini__lbl">Material Views</span>
              </div>
              <div className="seller-stat-mini">
                <span className="seller-stat-mini__val mono">98%</span>
                <span className="seller-stat-mini__lbl">Swap Success</span>
              </div>
              <div className="seller-stat-mini">
                <span className="seller-stat-mini__val mono">&lt; 2 hrs</span>
                <span className="seller-stat-mini__lbl">Avg Response</span>
              </div>
              <div className="seller-stat-mini">
                <span className="seller-stat-mini__val mono">{seller.totalSold + 4}</span>
                <span className="seller-stat-mini__lbl">Exchanges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-profile__divider" />

        {/* Listings */}
        <div className="seller-profile__listings">
          <h2 className="heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-5)' }}>
            {listings.length > 0
              ? `${listings.length} active material listing${listings.length !== 1 ? 's' : ''}`
              : 'No active listings'}
          </h2>
          {listings.length === 0 ? (
            <div className="seller-profile__empty">
              <span>This seller has no active material listings right now.</span>
              <Link to="/marketplace" className="btn btn--secondary btn--md">Browse Marketplace</Link>
            </div>
          ) : (
            <div className="seller-profile__grid">
              {listings.map((product, i) => (
                <div key={product.id} className={`reveal reveal-delay-${Math.min(i + 1, 5)}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
