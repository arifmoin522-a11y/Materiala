import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CONDITIONS, CITIES } from '../data/products';
import { StatusBadge, ConditionBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import './Dashboard.css';

const TABS = ['Overview', 'My Listings', 'Create Listing', 'Saved', 'Account'];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { products, savedItems, addProduct, updateProduct, deleteProduct, swapRequests, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', price: '', condition: '', location: '', city: '', canBuy: true, canSwap: false
  });
  const [imgPreview, setImgPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return <Navigate to="/auth" replace />;

  const myListings = products.filter(p => p.sellerId === currentUser.id);
  const mySaved    = products.filter(p => savedItems.includes(p.id));
  const mySwaps    = swapRequests.filter(s => s.requesterId === currentUser.id || s.receiverId === currentUser.id);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    addProduct({
      ...formData,
      price: Number(formData.price),
      sellerId: currentUser.id,
      images: [imgPreview || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80'],
      tags: [],
      featured: false,
    });
    showToast('Listing created successfully!', 'success');
    setFormData({ name:'', category:'', description:'', price:'', condition:'', location:'', city:'', canBuy:true, canSwap:false });
    setImgPreview(null);
    setActiveTab('My Listings');
    setSubmitting(false);
  };

  const handleStatusChange = (id, status) => {
    updateProduct(id, { status });
    showToast(`Listing marked as ${status}.`, 'success');
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    showToast('Listing deleted.', 'info');
  };

  return (
    <div className="dashboard page-enter">
      {/* ── SIDEBAR ── */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__profile">
          <img src={currentUser.avatar} alt={currentUser.name} className="dashboard__avatar" />
          <div>
            <span className="dashboard__name heading">{currentUser.name}</span>
            <span className="dashboard__city mono">{currentUser.city}</span>
          </div>
        </div>

        <nav className="dashboard__nav" aria-label="Dashboard navigation">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`dashboard__nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`dash-tab-${tab.toLowerCase().replace(' ', '-')}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="dashboard__stats">
          {[
            { label: 'Listings', val: myListings.length },
            { label: 'Sold',     val: currentUser.totalSold || 0 },
            { label: 'Swaps',    val: mySwaps.length },
            { label: 'Saved',    val: mySaved.length },
          ].map(s => (
            <div className="dash-stat" key={s.label}>
              <span className="dash-stat__val mono">{s.val}</span>
              <span className="dash-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard__main">
        <div className="dashboard__main-header">
          <span className="catalog-num mono">DASHBOARD / {activeTab.toUpperCase()}</span>
        </div>

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="dash-overview">
            <h1 className="dash-section-title heading">Welcome back, {currentUser.name.split(' ')[0]}.</h1>
            <p className="dash-section-sub">Here's what's happening with your listings and exchanges.</p>

            <div className="overview-cards">
              {[
                { label: 'Active Listings', value: myListings.filter(l => l.status === 'available').length, color: 'green' },
                { label: 'Pending Swaps',   value: mySwaps.filter(s => s.status === 'pending').length, color: 'mustard' },
                { label: 'Saved Items',     value: mySaved.length, color: 'blue' },
                { label: 'Total Listings',  value: myListings.length, color: 'charcoal' },
              ].map(card => (
                <div className={`overview-card overview-card--${card.color}`} key={card.label}>
                  <span className="overview-card__val mono">{card.value}</span>
                  <span className="overview-card__label">{card.label}</span>
                </div>
              ))}
            </div>

            <h2 className="heading" style={{ fontSize: 'var(--text-lg)', margin: 'var(--sp-8) 0 var(--sp-4)' }}>Recent Listings</h2>
            {myListings.length === 0 ? (
              <div className="dash-empty">
                <span>You haven't listed anything yet.</span>
                <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')}>Create your first listing</Button>
              </div>
            ) : (
              <div className="listing-table">
                {myListings.slice(0, 5).map(p => (
                  <div className="listing-row" key={p.id}>
                    <img src={p.images[0]} alt={p.name} className="listing-row__img" />
                    <div className="listing-row__info">
                      <span className="listing-row__name heading">{p.name}</span>
                      <span className="listing-row__meta mono">₹{p.price.toLocaleString('en-IN')} · {p.condition}</span>
                    </div>
                    <StatusBadge status={p.status} />
                    <div className="listing-row__actions">
                      <Link to={`/product/${p.id}`} className="btn btn--ghost btn--sm">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY LISTINGS */}
        {activeTab === 'My Listings' && (
          <div>
            <div className="dash-section-header">
              <div>
                <h1 className="dash-section-title heading">My Listings</h1>
                <p className="dash-section-sub">Manage your listed art materials.</p>
              </div>
              <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')} id="create-listing-btn">+ New Listing</Button>
            </div>

            {myListings.length === 0 ? (
              <div className="dash-empty">
                <span>No listings yet.</span>
                <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')}>Create your first listing</Button>
              </div>
            ) : (
              <div className="listing-table">
                {myListings.map(p => (
                  <div className="listing-row" key={p.id}>
                    <img src={p.images[0]} alt={p.name} className="listing-row__img" />
                    <div className="listing-row__info">
                      <span className="listing-row__name heading">{p.name}</span>
                      <span className="listing-row__meta mono">₹{p.price.toLocaleString('en-IN')} · {p.location}</span>
                    </div>
                    <ConditionBadge condition={p.condition} />
                    <StatusBadge status={p.status} />
                    <div className="listing-row__actions">
                      <Link to={`/product/${p.id}`} className="btn btn--ghost btn--sm">View</Link>
                      {p.status === 'available' && (
                        <button className="btn btn--ghost btn--sm" onClick={() => handleStatusChange(p.id, 'sold')}>Mark Sold</button>
                      )}
                      <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREATE LISTING */}
        {activeTab === 'Create Listing' && (
          <div>
            <h1 className="dash-section-title heading">Create a Listing</h1>
            <p className="dash-section-sub">List your unused art material in a few steps.</p>

            <form className="create-form" onSubmit={handleSubmitListing}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="listing-name" className="form-label">Product Name *</label>
                  <input id="listing-name" type="text" name="name" value={formData.name} onChange={handleFormChange} className="form-input" placeholder="Winsor & Newton Watercolor Set" required />
                </div>
                <div className="form-group">
                  <label htmlFor="listing-category" className="form-label">Category *</label>
                  <select id="listing-category" name="category" value={formData.category} onChange={handleFormChange} className="form-input" required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="listing-desc" className="form-label">Description</label>
                <textarea id="listing-desc" name="description" value={formData.description} onChange={handleFormChange} className="form-input" rows={4} placeholder="Describe the item condition, usage, what's included..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="listing-price" className="form-label">Price (₹) *</label>
                  <input id="listing-price" type="number" name="price" value={formData.price} onChange={handleFormChange} className="form-input" placeholder="500" min="1" required />
                </div>
                <div className="form-group">
                  <label htmlFor="listing-condition" className="form-label">Condition</label>
                  <select id="listing-condition" name="condition" value={formData.condition} onChange={handleFormChange} className="form-input">
                    <option value="">Select condition</option>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="listing-location" className="form-label">Area / Neighbourhood</label>
                  <input id="listing-location" type="text" name="location" value={formData.location} onChange={handleFormChange} className="form-input" placeholder="Koramangala" />
                </div>
                <div className="form-group">
                  <label htmlFor="listing-city" className="form-label">City</label>
                  <select id="listing-city" name="city" value={formData.city} onChange={handleFormChange} className="form-input">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div className="image-upload-area">
                  {imgPreview ? (
                    <div className="image-preview">
                      <img src={imgPreview} alt="Preview" />
                      <button type="button" className="image-preview__remove" onClick={() => setImgPreview(null)}>Remove</button>
                    </div>
                  ) : (
                    <label htmlFor="listing-image" className="image-upload-label">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Click to upload photo</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)' }}>JPG, PNG up to 5MB</span>
                      <input id="listing-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Exchange options */}
              <div className="form-group">
                <label className="form-label">Exchange Options</label>
                <div className="exchange-options">
                  <label className="checkbox-label">
                    <input type="checkbox" name="canBuy" checked={formData.canBuy} onChange={handleFormChange} />
                    <span>Open to buy/sell</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="canSwap" checked={formData.canSwap} onChange={handleFormChange} />
                    <span>Open to swap</span>
                  </label>
                </div>
              </div>

              <Button type="submit" variant="terracotta" size="lg" loading={submitting} id="submit-listing-btn">
                Publish Listing
              </Button>
            </form>
          </div>
        )}

        {/* SAVED */}
        {activeTab === 'Saved' && (
          <div>
            <h1 className="dash-section-title heading">Saved Items</h1>
            <p className="dash-section-sub">{mySaved.length} items in your collection.</p>
            {mySaved.length === 0 ? (
              <div className="dash-empty">
                <span>You haven't saved any items yet.</span>
                <Link to="/marketplace" className="btn btn--secondary btn--sm">Browse Marketplace</Link>
              </div>
            ) : (
              <div className="saved-grid">
                {mySaved.map(p => (
                  <Link to={`/product/${p.id}`} key={p.id} className="saved-card">
                    <img src={p.images[0]} alt={p.name} className="saved-card__img" />
                    <div className="saved-card__info">
                      <span className="saved-card__name">{p.name}</span>
                      <span className="saved-card__price mono">₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT */}
        {activeTab === 'Account' && (
          <div>
            <h1 className="dash-section-title heading">Account Settings</h1>
            <p className="dash-section-sub">Your profile information.</p>
            <div className="account-info">
              <div className="account-row">
                <span className="account-label">Name</span>
                <span className="account-val">{currentUser.name}</span>
              </div>
              <div className="account-row">
                <span className="account-label">City</span>
                <span className="account-val">{currentUser.city}</span>
              </div>
              <div className="account-row">
                <span className="account-label">Role</span>
                <span className="account-val" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
              </div>
              <div className="account-row">
                <span className="account-label">Member Since</span>
                <span className="account-val">{currentUser.joinedAt}</span>
              </div>
              {currentUser.rating && (
                <div className="account-row">
                  <span className="account-label">Rating</span>
                  <span className="account-val">★ {currentUser.rating}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
