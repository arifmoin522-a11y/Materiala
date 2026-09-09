import { Link, useParams } from 'react-router-dom';
import { USERS } from '../data/users';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/product/ProductCard';
import { useScrollRevealAll } from '../hooks/useScrollReveal';
import './SellerProfile.css';

export default function SellerProfile() {
  const { id } = useParams();
  const seller = USERS.find(u => u.id === id);
  useScrollRevealAll();

  if (!seller) return (
    <div style={{ textAlign: 'center', padding: '160px 24px 80px' }}>
      <h2 className="heading" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--sp-4)' }}>Seller not found</h2>
      <Link to="/marketplace" className="btn btn--primary">Back to Marketplace</Link>
    </div>
  );

  const listings = PRODUCTS.filter(p => p.sellerId === id && p.status === 'available');

  return (
    <div className="seller-profile page-enter">
      <div className="container">
        {/* Header */}
        <div className="seller-profile__header">
          <img src={seller.avatar} alt={seller.name} className="seller-profile__avatar" />
          <div className="seller-profile__info">
            <span className="catalog-num mono">SELLER / {id.toUpperCase()}</span>
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
          </div>
        </div>

        <div className="seller-profile__divider" />

        {/* Listings */}
        <div className="seller-profile__listings">
          <h2 className="heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-5)' }}>
            {listings.length > 0
              ? `${listings.length} active listing${listings.length !== 1 ? 's' : ''}`
              : 'No active listings'}
          </h2>
          {listings.length === 0 ? (
            <div className="seller-profile__empty">
              <span>This seller has no active listings right now.</span>
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
