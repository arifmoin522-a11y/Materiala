import { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CONDITIONS, CITIES } from '../data/products';
import { StatusBadge, ConditionBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import './Dashboard.css';

const TABS = ['Overview', 'Analytics', 'My Listings', 'Create Listing', 'Saved', 'Account'];

export default function Dashboard() {
  const { currentUser, updateProfile } = useAuth();
  const { products, savedItems, addProduct, updateProduct, deleteProduct, swapRequests, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');
  const [listingFilter, setListingFilter] = useState('all');
  const [analyticsRange, setAnalyticsRange] = useState('30d'); // '7d' | '30d' | 'all'
  const [activeChartBar, setActiveChartBar] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', price: '', condition: '', location: '', city: '', canBuy: true, canSwap: false
  });
  const [imgPreview, setImgPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    city: currentUser?.city || '',
    bio: currentUser?.bio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const myListings = useMemo(() => {
    return currentUser ? products.filter(p => p.sellerId === currentUser.id) : [];
  }, [products, currentUser]);

  const mySaved = useMemo(() => {
    return products.filter(p => savedItems.includes(p.id));
  }, [products, savedItems]);

  const mySwaps = useMemo(() => {
    return currentUser
      ? swapRequests.filter(s => s.requesterId === currentUser.id || s.receiverId === currentUser.id)
      : [];
  }, [swapRequests, currentUser]);

  // Analytics Computations
  const analytics = useMemo(() => {
    if (!currentUser) return null;
    const totalViews = myListings.reduce((sum, p) => sum + (p.views || 0), 0) + (currentUser.totalSold ? currentUser.totalSold * 35 : 120);
    const totalSaves = myListings.reduce((sum, p) => sum + (p.saves || 0), 0) + 14;
    const totalInventoryValue = myListings.reduce((sum, p) => sum + (p.price || 0), 0);
    const completedSwapsCount = mySwaps.filter(s => s.status === 'completed').length + (currentUser.totalSold || 3);
    const pendingSwapsCount = mySwaps.filter(s => s.status === 'pending').length;
    const estimatedValueTraded = (currentUser.totalSold || 3) * 850 + completedSwapsCount * 620;
    const estimatedSavings = completedSwapsCount * 450;
    const estimatedDivertedWasteKg = ((myListings.length + completedSwapsCount) * 1.35).toFixed(1);
    const co2DivertedKg = ((myListings.length + completedSwapsCount) * 2.7).toFixed(1);

    // Weekly engagement trends data
    const weeklyData = [
      { day: 'Mon', views: 42, inquiries: 4, date: 'Sep 4' },
      { day: 'Tue', views: 58, inquiries: 7, date: 'Sep 5' },
      { day: 'Wed', views: 39, inquiries: 3, date: 'Sep 6' },
      { day: 'Thu', views: 76, inquiries: 9, date: 'Sep 7' },
      { day: 'Fri', views: 94, inquiries: 12, date: 'Sep 8' },
      { day: 'Sat', views: 118, inquiries: 16, date: 'Sep 9' },
      { day: 'Sun', views: 85, inquiries: 11, date: 'Sep 10' },
    ];
    const maxDayViews = Math.max(...weeklyData.map(d => d.views));

    // Category distribution
    const catMap = {};
    myListings.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const catBreakdown = Object.entries(catMap).map(([catId, count]) => {
      const catObj = CATEGORIES.find(c => c.id === catId);
      return {
        id: catId,
        label: catObj?.label || catId,
        icon: catObj?.icon || '📦',
        count,
        percentage: Math.round((count / Math.max(myListings.length, 1)) * 100),
      };
    });

    // Top listings ranked
    const rankedListings = [...myListings].sort((a, b) => (b.views || 0) - (a.views || 0));

    return {
      totalViews,
      totalSaves,
      totalInventoryValue,
      completedSwapsCount,
      pendingSwapsCount,
      estimatedValueTraded,
      estimatedSavings,
      estimatedDivertedWasteKg,
      co2DivertedKg,
      weeklyData,
      maxDayViews,
      catBreakdown,
      rankedListings,
    };
  }, [myListings, mySwaps, currentUser]);

  if (!currentUser) return <Navigate to="/auth" replace />;

  // Filtered listings
  const filteredListings = myListings.filter(p => {
    if (listingFilter === 'available') return p.status === 'available';
    if (listingFilter === 'sold') return p.status === 'sold';
    return true;
  });

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
    await new Promise(r => setTimeout(r, 600));
    addProduct({
      ...formData,
      price: Number(formData.price),
      sellerId: currentUser.id,
      images: [imgPreview || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80'],
      tags: [formData.category],
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await new Promise(r => setTimeout(r, 400));
    updateProfile({
      name: profileForm.name,
      city: profileForm.city,
      bio: profileForm.bio,
    });
    setSavingProfile(false);
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="dashboard page-enter">
      {/* ── SIDEBAR ── */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__profile">
          <img src={currentUser.avatar} alt={currentUser.name} className="dashboard__avatar" />
          <div className="dashboard__profile-info">
            <span className="dashboard__name heading">{currentUser.name}</span>
            <span className="dashboard__city mono">{currentUser.city} · Artist</span>
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
              {tab === 'Analytics' && <span className="dash-nav-icon">📊</span>}
              {tab === 'Overview' && <span className="dash-nav-icon">⚡</span>}
              {tab === 'My Listings' && <span className="dash-nav-icon">📦</span>}
              {tab === 'Create Listing' && <span className="dash-nav-icon">＋</span>}
              {tab === 'Saved' && <span className="dash-nav-icon">🤍</span>}
              {tab === 'Account' && <span className="dash-nav-icon">⚙</span>}
              {tab}
            </button>
          ))}
        </nav>

        {/* Quick Stats Widget */}
        <div className="dashboard__stats">
          <div className="dash-stat">
            <span className="dash-stat__val mono">{myListings.length}</span>
            <span className="dash-stat__label">Listings</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat__val mono">{analytics.totalViews}</span>
            <span className="dash-stat__label">Views</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat__val mono">{mySwaps.length}</span>
            <span className="dash-stat__label">Swaps</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat__val mono">{mySaved.length}</span>
            <span className="dash-stat__label">Saved</span>
          </div>
        </div>

        {/* Direct Action Link */}
        <Link to={`/seller/${currentUser.id}`} className="dash-public-profile-btn mono">
          View Public Profile ↗
        </Link>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard__main">
        <div className="dashboard__main-header">
          <span className="catalog-num mono">DASHBOARD / {activeTab.toUpperCase()}</span>
          {activeTab === 'Overview' && (
            <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')}>
              + New Listing
            </Button>
          )}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div className="dash-overview">
            <div className="dash-welcome-banner">
              <div>
                <h1 className="dash-section-title heading">Welcome back, {currentUser.name.split(' ')[0]}.</h1>
                <p className="dash-section-sub">Here's your live marketplace activity and material impact summary.</p>
              </div>
              <div className="dash-quick-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => setActiveTab('Analytics')}>
                  📊 View Full Analytics
                </button>
              </div>
            </div>

            <div className="overview-cards">
              <div className="overview-card overview-card--green">
                <span className="overview-card__val mono">{myListings.filter(l => l.status === 'available').length}</span>
                <span className="overview-card__label">Active Listings</span>
                <span className="overview-card__sub mono">₹{analytics.totalInventoryValue.toLocaleString('en-IN')} total value</span>
              </div>
              <div className="overview-card overview-card--terracotta">
                <span className="overview-card__val mono">{analytics.totalViews}</span>
                <span className="overview-card__label">Listing Views</span>
                <span className="overview-card__sub mono">↑ 24% this week</span>
              </div>
              <div className="overview-card overview-card--mustard">
                <span className="overview-card__val mono">{analytics.pendingSwapsCount}</span>
                <span className="overview-card__label">Pending Swaps</span>
                <span className="overview-card__sub mono">{analytics.completedSwapsCount} completed</span>
              </div>
              <div className="overview-card overview-card--blue">
                <span className="overview-card__val mono">₹{analytics.estimatedValueTraded.toLocaleString('en-IN')}</span>
                <span className="overview-card__label">Value Realized</span>
                <span className="overview-card__sub mono">₹{analytics.estimatedSavings.toLocaleString('en-IN')} saved via swap</span>
              </div>
            </div>

            {/* Quick Analytics Teaser */}
            <div className="dash-analytics-teaser" onClick={() => setActiveTab('Analytics')}>
              <div className="dash-teaser-left">
                <span className="dash-teaser-tag mono">PERFORMANCE INSIGHT</span>
                <h3 className="heading">Your listings saw 512 total impressions this week</h3>
                <p>Watercolor & acrylic supplies have the highest exchange interest in {currentUser.city}.</p>
              </div>
              <button className="btn btn--terracotta btn--sm">
                Explore Analytics →
              </button>
            </div>

            {/* Recent Listings */}
            <div className="dash-recent-header">
              <h2 className="heading" style={{ fontSize: 'var(--text-lg)' }}>Recent Listings</h2>
              <button className="dash-link-btn mono" onClick={() => setActiveTab('My Listings')}>
                View all ({myListings.length}) →
              </button>
            </div>

            {myListings.length === 0 ? (
              <div className="dash-empty">
                <span style={{ fontSize: '36px' }}>🎨</span>
                <h3 className="heading">You haven't listed any art materials yet</h3>
                <p>List unused paints, brushes, canvas or sketchbooks to start exchanging.</p>
                <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')}>Create your first listing</Button>
              </div>
            ) : (
              <div className="listing-table">
                {myListings.slice(0, 5).map(p => (
                  <div className="listing-row" key={p.id}>
                    <img src={p.images[0]} alt={p.name} className="listing-row__img" />
                    <div className="listing-row__info">
                      <span className="listing-row__name heading">{p.name}</span>
                      <span className="listing-row__meta mono">₹{p.price.toLocaleString('en-IN')} · {p.condition} · {p.views || 0} views</span>
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

        {/* ── PROFILE ANALYTICS TAB ── */}
        {activeTab === 'Analytics' && (
          <div className="dash-analytics page-enter">
            <div className="analytics-header">
              <div>
                <h1 className="dash-section-title heading">Profile & Listings Analytics</h1>
                <p className="dash-section-sub">Comprehensive real-time insights into your material views, engagement, and circular impact.</p>
              </div>
              <div className="analytics-range-selector" role="toolbar" aria-label="Time range">
                <button className={`range-btn ${analyticsRange === '7d' ? 'active' : ''}`} onClick={() => setAnalyticsRange('7d')}>7 Days</button>
                <button className={`range-btn ${analyticsRange === '30d' ? 'active' : ''}`} onClick={() => setAnalyticsRange('30d')}>30 Days</button>
                <button className={`range-btn ${analyticsRange === 'all' ? 'active' : ''}`} onClick={() => setAnalyticsRange('all')}>All Time</button>
              </div>
            </div>

            {/* Core KPI Metrics Grid */}
            <div className="analytics-kpis-grid">
              <div className="kpi-card">
                <span className="kpi-card__label mono">TOTAL MATERIAL VIEWS</span>
                <span className="kpi-card__val mono">{analytics.totalViews}</span>
                <span className="kpi-card__trend positive">↑ 24.8% vs previous period</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card__label mono">ESTIMATED IMPRESSIONS</span>
                <span className="kpi-card__val mono">{analytics.totalViews * 4 + 180}</span>
                <span className="kpi-card__trend positive">↑ 18.2% search reach</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card__label mono">WISHLIST SAVES</span>
                <span className="kpi-card__val mono">{analytics.totalSaves}</span>
                <span className="kpi-card__trend">In {analytics.totalSaves} artists' studios</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card__label mono">SWAPS COMPLETED</span>
                <span className="kpi-card__val mono">{analytics.completedSwapsCount}</span>
                <span className="kpi-card__trend positive">98% satisfaction rate</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card__label mono">VALUE REALIZED (₹)</span>
                <span className="kpi-card__val mono">₹{analytics.estimatedValueTraded.toLocaleString('en-IN')}</span>
                <span className="kpi-card__trend positive">₹{analytics.estimatedSavings.toLocaleString('en-IN')} saved in swaps</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card__label mono">AVG SELLER RESPONSE</span>
                <span className="kpi-card__val mono">&lt; 2 hrs</span>
                <span className="kpi-card__trend positive">⚡ Super responsive</span>
              </div>
            </div>

            {/* Chart & Category Grid */}
            <div className="analytics-charts-row">
              {/* Weekly View Trend Bar Chart */}
              <div className="analytics-card chart-card">
                <div className="chart-card__header">
                  <div>
                    <h3 className="heading" style={{ fontSize: 'var(--text-md)' }}>Weekly Engagement Trend</h3>
                    <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)' }}>Daily views and exchange inquiries</span>
                  </div>
                  <span className="chart-stat-badge mono">Peak: 118 views/day</span>
                </div>

                <div className="bar-chart-container">
                  <div className="bar-chart">
                    {analytics.weeklyData.map((d, i) => {
                      const heightPct = Math.round((d.views / analytics.maxDayViews) * 100);
                      const isHovered = activeChartBar === i;
                      return (
                        <div
                          key={d.day}
                          className={`bar-group ${isHovered ? 'active' : ''}`}
                          onMouseEnter={() => setActiveChartBar(i)}
                          onMouseLeave={() => setActiveChartBar(null)}
                        >
                          <div className="bar-tooltip">
                            <strong>{d.views} views</strong>
                            <span>{d.inquiries} inquiries</span>
                            <span className="mono">{d.date}</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ height: `${heightPct}%` }} />
                          </div>
                          <span className="bar-label mono">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category Breakdown & Demographics */}
              <div className="analytics-card category-breakdown-card">
                <h3 className="heading" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--sp-2)' }}>Category Distribution</h3>
                <p className="dash-section-sub" style={{ marginBottom: 'var(--sp-4)' }}>Breakdown of your listed materials by discipline</p>

                {analytics.catBreakdown.length === 0 ? (
                  <div className="cat-empty-msg mono">Add listings to see category distributions.</div>
                ) : (
                  <div className="category-bars">
                    {analytics.catBreakdown.map(cat => (
                      <div className="cat-bar-item" key={cat.id}>
                        <div className="cat-bar-header">
                          <span className="cat-bar-name">{cat.icon} {cat.label}</span>
                          <span className="cat-bar-pct mono">{cat.count} item{cat.count !== 1 ? 's' : ''} ({cat.percentage}%)</span>
                        </div>
                        <div className="cat-bar-track">
                          <div className="cat-bar-fill" style={{ width: `${cat.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="audience-reach-mini">
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--color-charcoal-40)', textTransform: 'uppercase' }}>Top Audience Locations</span>
                  <div className="audience-cities-tags">
                    <span className="city-tag">Delhi (34%)</span>
                    <span className="city-tag">Bengaluru (28%)</span>
                    <span className="city-tag">Mumbai (22%)</span>
                    <span className="city-tag">Hyderabad (16%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion Funnel & Eco Impact */}
            <div className="analytics-charts-row">
              {/* Funnel */}
              <div className="analytics-card funnel-card">
                <h3 className="heading" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--sp-2)' }}>Listing Conversion Funnel</h3>
                <p className="dash-section-sub" style={{ marginBottom: 'var(--sp-4)' }}>From browsing impressions to completed handovers</p>
                <div className="funnel-steps">
                  <div className="funnel-step">
                    <div className="funnel-step__left">
                      <span className="funnel-step__name">1. Search Impressions</span>
                      <span className="funnel-step__sub">Users who saw your materials in search</span>
                    </div>
                    <span className="funnel-step__count mono">1,420</span>
                  </div>
                  <div className="funnel-step">
                    <div className="funnel-step__left">
                      <span className="funnel-step__name">2. Product Page Views</span>
                      <span className="funnel-step__sub">Direct clicks into item details</span>
                    </div>
                    <span className="funnel-step__count mono">{analytics.totalViews} (27%)</span>
                  </div>
                  <div className="funnel-step">
                    <div className="funnel-step__left">
                      <span className="funnel-step__name">3. Inquiries & Offers</span>
                      <span className="funnel-step__sub">Chat inquiries & swap proposals</span>
                    </div>
                    <span className="funnel-step__count mono">48 (12%)</span>
                  </div>
                  <div className="funnel-step">
                    <div className="funnel-step__left">
                      <span className="funnel-step__name">4. Completed Exchanges</span>
                      <span className="funnel-step__sub">Successful swaps or buy handovers</span>
                    </div>
                    <span className="funnel-step__count mono highlight">{analytics.completedSwapsCount} (25%)</span>
                  </div>
                </div>
              </div>

              {/* Circular Economy Scorecard */}
              <div className="analytics-card eco-card">
                <div className="eco-card__badge">🌱 CIRCULAR ECONOMY IMPACT</div>
                <h3 className="heading" style={{ fontSize: 'var(--text-lg)', margin: 'var(--sp-3) 0 var(--sp-2)' }}>Material Life Extension</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)', marginBottom: 'var(--sp-4)' }}>
                  By circulating your surplus tools and supplies, you reduce artistic waste across India.
                </p>

                <div className="eco-stats-grid">
                  <div className="eco-stat">
                    <span className="eco-stat__val mono">{analytics.estimatedDivertedWasteKg} kg</span>
                    <span className="eco-stat__label">Materials Kept in Circulation</span>
                  </div>
                  <div className="eco-stat">
                    <span className="eco-stat__val mono">{analytics.co2DivertedKg} kg</span>
                    <span className="eco-stat__label">Estimated CO₂e Offset</span>
                  </div>
                  <div className="eco-stat">
                    <span className="eco-stat__val mono">{analytics.completedSwapsCount + 2}</span>
                    <span className="eco-stat__label">Fellow Artists Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance by Material Table */}
            <div className="analytics-card top-materials-card">
              <h3 className="heading" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--sp-2)' }}>Material Performance Ranking</h3>
              <p className="dash-section-sub" style={{ marginBottom: 'var(--sp-4)' }}>Detailed engagement analytics for each of your listings</p>

              {analytics.rankedListings.length === 0 ? (
                <div className="dash-empty">
                  <span>No listings available to rank.</span>
                  <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')}>Create a Listing</Button>
                </div>
              ) : (
                <div className="analytics-table-wrap">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Views</th>
                        <th>Saves</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.rankedListings.map(p => (
                        <tr key={p.id}>
                          <td className="material-cell">
                            <img src={p.images[0]} alt={p.name} className="table-thumb" />
                            <span className="table-name heading">{p.name}</span>
                          </td>
                          <td className="mono" style={{ textTransform: 'capitalize' }}>{p.category}</td>
                          <td className="mono font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="mono">{p.views || 0}</td>
                          <td className="mono">{p.saves || 0}</td>
                          <td><StatusBadge status={p.status} /></td>
                          <td>
                            <Link to={`/product/${p.id}`} className="btn btn--ghost btn--sm">View Page</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MY LISTINGS TAB ── */}
        {activeTab === 'My Listings' && (
          <div>
            <div className="dash-section-header">
              <div>
                <h1 className="dash-section-title heading">My Listings</h1>
                <p className="dash-section-sub">Manage your listed art materials, toggle availability, and track interest.</p>
              </div>
              <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')} id="create-listing-btn">+ New Listing</Button>
            </div>

            {/* Listing Status Filter Buttons */}
            <div className="listing-status-filter" role="toolbar" aria-label="Filter listings by status">
              <button
                className={`status-filter-btn ${listingFilter === 'all' ? 'active' : ''}`}
                onClick={() => setListingFilter('all')}
              >
                All ({myListings.length})
              </button>
              <button
                className={`status-filter-btn ${listingFilter === 'available' ? 'active' : ''}`}
                onClick={() => setListingFilter('available')}
              >
                Available ({myListings.filter(l => l.status === 'available').length})
              </button>
              <button
                className={`status-filter-btn ${listingFilter === 'sold' ? 'active' : ''}`}
                onClick={() => setListingFilter('sold')}
              >
                Sold ({myListings.filter(l => l.status === 'sold').length})
              </button>
            </div>

            {filteredListings.length === 0 ? (
              <div className="dash-empty">
                <span style={{ fontSize: '32px' }}>📦</span>
                <h3 className="heading">No {listingFilter !== 'all' ? listingFilter : ''} listings found</h3>
                <p>Create a listing or clear your filter.</p>
                {listingFilter !== 'all' ? (
                  <button className="btn btn--secondary btn--sm" onClick={() => setListingFilter('all')}>Show All Listings</button>
                ) : (
                  <Button variant="terracotta" size="sm" onClick={() => setActiveTab('Create Listing')}>Create your first listing</Button>
                )}
              </div>
            ) : (
              <div className="listing-table">
                {filteredListings.map(p => (
                  <div className="listing-row" key={p.id}>
                    <img src={p.images[0]} alt={p.name} className="listing-row__img" />
                    <div className="listing-row__info">
                      <span className="listing-row__name heading">{p.name}</span>
                      <span className="listing-row__meta mono">₹{p.price.toLocaleString('en-IN')} · {p.location || p.city} · {p.views || 0} views</span>
                    </div>
                    <ConditionBadge condition={p.condition} />
                    <StatusBadge status={p.status} />
                    <div className="listing-row__actions">
                      <Link to={`/product/${p.id}`} className="btn btn--ghost btn--sm">View</Link>
                      {p.status === 'available' ? (
                        <button className="btn btn--ghost btn--sm" onClick={() => handleStatusChange(p.id, 'sold')}>Mark Sold</button>
                      ) : (
                        <button className="btn btn--ghost btn--sm" onClick={() => handleStatusChange(p.id, 'available')}>Relist</button>
                      )}
                      <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE LISTING TAB ── */}
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

        {/* ── SAVED TAB ── */}
        {activeTab === 'Saved' && (
          <div>
            <h1 className="dash-section-title heading">Saved Items</h1>
            <p className="dash-section-sub">{mySaved.length} items in your wishlist collection.</p>
            {mySaved.length === 0 ? (
              <div className="dash-empty">
                <span style={{ fontSize: '32px' }}>🤍</span>
                <h3 className="heading">Your saved collection is empty</h3>
                <p>Browse the marketplace and click the heart icon on any art material to save it for later.</p>
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

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'Account' && (
          <div className="dash-account page-enter">
            <h1 className="dash-section-title heading">Account & Profile Settings</h1>
            <p className="dash-section-sub">Update your artist profile details and public preferences.</p>

            <form className="account-edit-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label htmlFor="profile-name" className="form-label">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-city" className="form-label">City</label>
                <select
                  id="profile-city"
                  className="form-input"
                  value={profileForm.city}
                  onChange={e => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="profile-bio" className="form-label">Artist Bio</label>
                <textarea
                  id="profile-bio"
                  className="form-input"
                  rows={3}
                  placeholder="Tell other artists about your mediums, studio practice, and materials you like..."
                  value={profileForm.bio}
                  onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="account-readonly-meta">
                <div className="account-row">
                  <span className="account-label">Member Since</span>
                  <span className="account-val mono">{currentUser.joinedAt || '2026'}</span>
                </div>
                <div className="account-row">
                  <span className="account-label">Role</span>
                  <span className="account-val mono" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
                </div>
                {currentUser.rating && (
                  <div className="account-row">
                    <span className="account-label">Community Rating</span>
                    <span className="account-val mono">★ {currentUser.rating}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'var(--sp-5)' }}>
                <Button type="submit" variant="terracotta" size="md" loading={savingProfile}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
