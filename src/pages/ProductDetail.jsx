import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../data/users';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { ConditionBadge, SwapBadge, CategoryBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, savedItems, saveItem, showToast, startConversation, addSwapRequest } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const product = products.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');

  if (!product) return (
    <div className="not-found page-enter">
      <div className="container" style={{ textAlign: 'center', paddingTop: '160px' }}>
        <span style={{ fontSize: '48px' }}>🎨</span>
        <h2 className="heading" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--sp-5) 0 var(--sp-3)' }}>Listing not found</h2>
        <p style={{ color: 'var(--color-charcoal-40)', marginBottom: 'var(--sp-6)' }}>This item may have been sold or removed.</p>
        <Link to="/marketplace" className="btn btn--primary">Back to Marketplace</Link>
      </div>
    </div>
  );

  const seller = getUserById(product.sellerId);
  const category = CATEGORIES.find(c => c.id === product.category);
  const isSaved = savedItems.includes(product.id);
  const isOwn = currentUser?.id === product.sellerId;

  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleMessage = () => {
    if (!currentUser) { navigate('/auth'); return; }
    const convId = startConversation(product.sellerId, product.id, product.name, currentUser.id);
    navigate(`/chat?conv=${convId}`);
    showToast('Conversation started!', 'success');
  };

  const handleSwapRequest = () => {
    if (!currentUser) { navigate('/auth'); return; }
    const userListing = products.find(p => p.sellerId === currentUser.id);
    addSwapRequest({
      type: 'outgoing',
      requesterId: currentUser.id,
      receiverId: product.sellerId,
      offeredProductId: userListing ? userListing.id : 'user-selection',
      offeredProductName: userListing ? userListing.name : 'Curated Art Supplies Selection',
      offeredProductImage: userListing?.images?.[0] || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&q=80',
      requestedProductId: product.id,
      requestedProductName: product.name,
      requestedProductImage: product.images[0],
      message: swapMessage || `Hi! I'd like to swap for your ${product.name}.`,
      location: currentUser.city,
    });
    setShowSwapModal(false);
    showToast('Swap request sent!', 'success');
  };

  const handleBuy = () => {
    if (!currentUser) { navigate('/auth'); return; }
    showToast('Buy intent sent! The seller will be notified.', 'success');
    setTimeout(() => handleMessage(), 600);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="product-detail page-enter">
      <div className="container product-detail__inner">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/marketplace">Marketplace</Link>
          <span>/</span>
          <Link to={`/marketplace?category=${product.category}`}>{category?.label}</Link>
          <span>/</span>
          <span>{product.name.slice(0, 35)}...</span>
        </nav>

        <div className="product-detail__main">
          {/* ── LEFT: Gallery ── */}
          <div className="product-detail__gallery">
            <div className="gallery__main">
              <img
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                className="gallery__main-img"
              />
              {discount && <span className="gallery__discount">{discount}% off</span>}
            </div>

            {product.images.length > 1 && (
              <div className="gallery__thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`gallery__thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="product-detail__info">
            {/* Catalog meta */}
            <div className="product-detail__meta-row">
              <span className="catalog-num mono">{product.id.toUpperCase()}</span>
              <span className="product-detail__date mono">Listed {product.listedAt}</span>
            </div>

            <div className="product-detail__badges">
              <CategoryBadge label={category?.label || product.category} />
              <ConditionBadge condition={product.condition} />
              {product.canSwap && <SwapBadge />}
            </div>

            <h1 className="product-detail__name heading">{product.name}</h1>

            {/* Price */}
            <div className="product-detail__price-block">
              <span className="product-detail__price mono">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <>
                  <span className="product-detail__original mono">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  {discount && <span className="product-detail__saving">Save {discount}%</span>}
                </>
              )}
            </div>

            {/* Location */}
            <div className="product-detail__location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{product.location}, {product.city}</span>
            </div>

            <div className="product-detail__divider" />

            {/* Description */}
            <div className="product-detail__desc">
              <h2 className="product-detail__section-title heading">About this listing</h2>
              <p>{product.description}</p>
            </div>

            {/* Details */}
            <dl className="product-detail__specs">
              <div className="spec-row">
                <dt>Condition</dt>
                <dd>{product.condition}</dd>
              </div>
              <div className="spec-row">
                <dt>Category</dt>
                <dd>{category?.label}</dd>
              </div>
              <div className="spec-row">
                <dt>Quantity</dt>
                <dd>{product.quantity} available</dd>
              </div>
              <div className="spec-row">
                <dt>Exchange</dt>
                <dd>{product.canBuy ? 'Buy ✓' : ''} {product.canSwap ? '  Swap ✓' : ''}</dd>
              </div>
            </dl>

            <div className="product-detail__divider" />

            {/* Seller */}
            {seller && (
              <div className="product-detail__seller-card">
                <Link to={`/seller/${seller.id}`} style={{ display: 'flex', flexShrink: 0 }}>
                  <img src={seller.avatar} alt={seller.name} className="seller-card__avatar" />
                </Link>
                <div className="seller-card__info">
                  <Link to={`/seller/${seller.id}`} className="seller-card__name heading" style={{ textDecoration: 'none' }}>
                    {seller.name}
                  </Link>
                  <span className="seller-card__meta mono">
                    {seller.city} · {seller.totalListings} listings · ★ {seller.rating}
                  </span>
                  <span className="seller-card__since">Member since {seller.joinedAt}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            {!isOwn && (
              <div className="product-detail__actions">
                {product.canBuy && (
                  <Button variant="terracotta" size="lg" fullWidth onClick={handleBuy} id="buy-btn">
                    Express Interest in Buying
                  </Button>
                )}
                {product.canSwap && (
                  <Button variant="secondary" size="lg" fullWidth onClick={() => setShowSwapModal(true)} id="swap-btn">
                    ⇄ Request a Swap
                  </Button>
                )}
                <Button variant="ghost" size="lg" fullWidth onClick={handleMessage} id="message-btn">
                  Message Seller
                </Button>
                <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                  <button
                    className={`save-btn ${isSaved ? 'saved' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (!currentUser) { navigate('/auth'); return; }
                      saveItem(product.id);
                      showToast(isSaved ? 'Removed from saved' : 'Saved!', 'success');
                    }}
                    id="save-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {isSaved ? 'Saved' : 'Save listing'}
                  </button>
                  <button
                    className="save-btn"
                    style={{ flex: 1 }}
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      showToast('Listing link copied to clipboard!', 'success');
                    }}
                    id="share-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            )}

            {isOwn && (
              <div className="product-detail__own-badge">
                <span>This is your listing.</span>
                <Link to="/dashboard" className="btn btn--secondary btn--sm">Manage in Dashboard</Link>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="product-detail__related">
            <h2 className="heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-5)' }}>
              More in {category?.label}
            </h2>
            <div className="related-grid">
              {related.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="related-card">
                  <img src={p.images[0]} alt={p.name} className="related-card__img" />
                  <div className="related-card__info">
                    <span className="related-card__name">{p.name}</span>
                    <span className="related-card__price mono">₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Swap Modal */}
      <Modal isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} title="Request a Swap">
        <div className="swap-modal-body">
          <p style={{ marginBottom: 'var(--sp-4)', color: 'var(--color-charcoal-80)', fontSize: 'var(--text-sm)' }}>
            You're requesting to swap for <strong>{product.name}</strong>.
            Tell the seller what you're offering and add a personal note.
          </p>
          <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
            <label htmlFor="swap-msg" className="form-label">Your message</label>
            <textarea
              id="swap-msg"
              className="form-input"
              rows={4}
              placeholder={`Hi! I'd like to swap for your ${product.name}. I can offer...`}
              value={swapMessage}
              onChange={e => setSwapMessage(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <Button variant="terracotta" fullWidth onClick={handleSwapRequest} id="confirm-swap-btn">Send Swap Request</Button>
            <Button variant="ghost" onClick={() => setShowSwapModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
