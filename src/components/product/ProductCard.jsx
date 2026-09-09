import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../data/users';
import { ConditionBadge, SwapBadge, CategoryBadge } from '../ui/Badge';
import { CATEGORIES } from '../../data/products';
import './ProductCard.css';

export default function ProductCard({ product, variant = 'default' }) {
  const { savedItems, saveItem, showToast } = useApp();
  const { currentUser } = useAuth();
  const isSaved = savedItems.includes(product.id);
  const seller = getUserById(product.sellerId);
  const category = CATEGORIES.find(c => c.id === product.category);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      showToast('Sign in to save items', 'info');
      return;
    }
    saveItem(product.id);
    showToast(isSaved ? 'Removed from saved' : 'Saved to your collection', 'success');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`product-card product-card--${variant}`}
      aria-label={`${product.name} — ₹${product.price}`}
    >
      {/* Image */}
      <div className="product-card__image-wrap">
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        {/* Catalog number */}
        <span className="product-card__catalog">{product.id.toUpperCase()}</span>

        {/* Overlay actions */}
        <div className="product-card__overlay">
          <button
            className="product-card__action-btn"
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save item'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Badges */}
        <div className="product-card__badges">
          <ConditionBadge condition={product.condition} />
          {product.canSwap && <SwapBadge />}
        </div>
      </div>

      {/* Info */}
      <div className="product-card__info">
        <div className="product-card__meta">
          <CategoryBadge label={category?.label || product.category} />
          <span className="product-card__location">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {product.location}
          </span>
        </div>

        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__footer">
          <div className="product-card__price-wrap">
            <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="product-card__original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          {seller && (
            <span className="product-card__seller">
              <img src={seller.avatar} alt={seller.name} className="product-card__seller-avatar" />
              {seller.name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
