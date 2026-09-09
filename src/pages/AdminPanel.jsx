import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/users';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import './AdminPanel.css';

const ADMIN_TABS = ['Overview', 'Users', 'Listings', 'Disputes'];

const DISPUTES = [
  { id: 'd001', user: 'u001', reportedUser: 'u003', reason: 'Item condition misrepresented', status: 'open', date: '2026-09-06' },
  { id: 'd002', user: 'u008', reportedUser: 'u012', reason: 'Item not handed over after swap agreement', status: 'investigating', date: '2026-09-07' },
  { id: 'd003', user: 'u005', reportedUser: 'u007', reason: 'Unresponsive after payment discussed', status: 'resolved', date: '2026-09-01' },
];

export default function AdminPanel() {
  const { currentUser, logout } = useAuth();
  const { products, updateProduct, deleteProduct, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');
  const [userSearch, setUserSearch] = useState('');
  const [suspendedUsers, setSuspendedUsers] = useState([]);

  const handleSwitchToAdmin = () => {
    logout();
    window.location.href = '/auth';
  };

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '160px var(--sp-5) 0' }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--sp-4)' }}>🔒</div>
        <h2 className="heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-3)' }}>
          Admin access only
        </h2>
        {currentUser ? (
          <>
            <p style={{ color: 'var(--color-charcoal-40)', marginBottom: 'var(--sp-5)', fontSize: 'var(--text-sm)' }}>
              You're signed in as <strong>{currentUser.name}</strong> — not an admin.
            </p>
            <button className="btn btn--terracotta btn--md" onClick={handleSwitchToAdmin}>
              Switch to Admin Account
            </button>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--color-charcoal-40)', marginBottom: 'var(--sp-5)', fontSize: 'var(--text-sm)' }}>
              Sign in with <strong>admin@artsupply.in</strong> / <strong>admin1234</strong>
            </p>
            <Link to="/auth" className="btn btn--terracotta btn--md">Sign In as Admin</Link>
          </>
        )}
      </div>
    );
  }

  const filteredUsers = USERS
    .filter(u => !u.isAdmin)
    .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.city.toLowerCase().includes(userSearch.toLowerCase()));

  const handleSuspend = (userId) => {
    setSuspendedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    showToast(suspendedUsers.includes(userId) ? 'User reinstated.' : 'User suspended.', 'info');
  };

  const handleRemoveListing = (id) => {
    deleteProduct(id);
    showToast('Listing removed.', 'success');
  };

  const handleFlagListing = (id) => {
    updateProduct(id, { status: 'inactive' });
    showToast('Listing flagged and hidden.', 'info');
  };

  const stats = {
    users: USERS.filter(u => !u.isAdmin).length,
    listings: products.length,
    available: products.filter(p => p.status === 'available').length,
    disputes: DISPUTES.filter(d => d.status !== 'resolved').length,
  };

  return (
    <div className="admin-page page-enter">
      {/* ─── HEADER ── */}
      <div className="admin-header bg-charcoal">
        <div className="container">
          <span className="catalog-num mono" style={{ color: 'rgba(245,240,232,0.35)' }}>ADMIN / PANEL</span>
          <h1 className="admin-title heading">Platform Management</h1>
          <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 'var(--text-sm)' }}>
            Art Supply Exchange · Administrator Dashboard
          </p>
        </div>
      </div>

      <div className="container admin-body">
        {/* Tabs */}
        <div className="admin-tabs">
          {ADMIN_TABS.map(tab => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`admin-tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'Overview' && (
          <div>
            <h2 className="admin-section-title heading">Platform Overview</h2>
            <div className="admin-overview-grid">
              {[
                { label: 'Total Users',    val: stats.users,     color: 'blue' },
                { label: 'Total Listings', val: stats.listings,   color: 'green' },
                { label: 'Active',         val: stats.available,  color: 'mustard' },
                { label: 'Open Disputes',  val: stats.disputes,   color: 'red' },
              ].map(s => (
                <div className={`admin-stat-card admin-stat-card--${s.color}`} key={s.label}>
                  <span className="admin-stat-val mono">{s.val}</span>
                  <span className="admin-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <h2 className="admin-section-title heading" style={{ marginTop: 'var(--sp-8)' }}>Recent Listings</h2>
            <div className="admin-table">
              <div className="admin-table__head">
                <span>Product</span>
                <span>Seller</span>
                <span>Price</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {products.slice(0, 8).map(p => (
                <div className="admin-table__row" key={p.id}>
                  <div className="admin-product-cell">
                    <img src={p.images[0]} alt={p.name} className="admin-product-img" />
                    <span className="admin-product-name">{p.name}</span>
                  </div>
                  <span className="admin-cell mono">{p.sellerId}</span>
                  <span className="admin-cell mono">₹{p.price.toLocaleString('en-IN')}</span>
                  <StatusBadge status={p.status} />
                  <div className="admin-cell admin-actions">
                    <button className="admin-action-btn" onClick={() => handleFlagListing(p.id)} title="Flag listing">🚩</button>
                    <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleRemoveListing(p.id)} title="Remove listing">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {activeTab === 'Users' && (
          <div>
            <div className="admin-section-header">
              <h2 className="admin-section-title heading">User Management</h2>
              <input
                id="admin-user-search"
                type="search"
                className="form-input admin-search"
                placeholder="Search by name or city..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            <div className="admin-table">
              <div className="admin-table__head admin-table__head--users">
                <span>User</span>
                <span>City</span>
                <span>Listings</span>
                <span>Rating</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {filteredUsers.map(u => {
                const isSuspended = suspendedUsers.includes(u.id);
                return (
                  <div className={`admin-table__row ${isSuspended ? 'admin-table__row--suspended' : ''}`} key={u.id}>
                    <div className="admin-user-cell">
                      <img src={u.avatar} alt={u.name} className="admin-user-avatar" />
                      <div>
                        <span className="admin-user-name heading">{u.name}</span>
                        <span className="admin-user-since mono">Since {u.joinedAt}</span>
                      </div>
                    </div>
                    <span className="admin-cell">{u.city}</span>
                    <span className="admin-cell mono">{u.totalListings}</span>
                    <span className="admin-cell mono">★ {u.rating || '—'}</span>
                    <span className={`admin-cell ${isSuspended ? 'text-danger' : 'text-success'}`}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                    <div className="admin-cell admin-actions">
                      <button
                        className={`admin-action-btn ${isSuspended ? 'admin-action-btn--reinstate' : 'admin-action-btn--suspend'}`}
                        onClick={() => handleSuspend(u.id)}
                        id={`admin-suspend-${u.id}`}
                      >
                        {isSuspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── LISTINGS ─── */}
        {activeTab === 'Listings' && (
          <div>
            <h2 className="admin-section-title heading">Listing Moderation</h2>
            <p style={{ color: 'var(--color-charcoal-40)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-5)' }}>
              {products.length} total listings · {products.filter(p => p.status === 'available').length} active
            </p>
            <div className="admin-table">
              <div className="admin-table__head">
                <span>Product</span>
                <span>Seller</span>
                <span>Price</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {products.map(p => (
                <div className="admin-table__row" key={p.id}>
                  <div className="admin-product-cell">
                    <img src={p.images[0]} alt={p.name} className="admin-product-img" />
                    <div>
                      <span className="admin-product-name">{p.name}</span>
                      <span className="admin-cell mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)' }}>{p.city}</span>
                    </div>
                  </div>
                  <span className="admin-cell mono">{p.sellerId}</span>
                  <span className="admin-cell mono">₹{p.price.toLocaleString('en-IN')}</span>
                  <StatusBadge status={p.status} />
                  <div className="admin-cell admin-actions">
                    <a href={`/product/${p.id}`} className="admin-action-btn" target="_blank" rel="noopener noreferrer">👁</a>
                    <button className="admin-action-btn" onClick={() => handleFlagListing(p.id)} title="Flag">🚩</button>
                    <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleRemoveListing(p.id)} title="Delete">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── DISPUTES ─── */}
        {activeTab === 'Disputes' && (
          <div>
            <h2 className="admin-section-title heading">Disputes & Reports</h2>
            <div className="disputes-list">
              {DISPUTES.map(d => {
                const reporter = USERS.find(u => u.id === d.user);
                const reported = USERS.find(u => u.id === d.reportedUser);
                return (
                  <div key={d.id} className={`dispute-card dispute-card--${d.status}`}>
                    <div className="dispute-card__header">
                      <span className={`dispute-status dispute-status--${d.status}`}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                      <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)' }}>{d.date}</span>
                    </div>
                    <p className="dispute-reason">{d.reason}</p>
                    <div className="dispute-parties">
                      <div className="dispute-party">
                        <img src={reporter?.avatar} alt={reporter?.name} className="dispute-avatar" />
                        <div>
                          <span className="dispute-party-label mono">REPORTER</span>
                          <span className="dispute-party-name">{reporter?.name}</span>
                        </div>
                      </div>
                      <span style={{ color: 'var(--color-charcoal-40)', fontSize: 'var(--text-lg)' }}>→</span>
                      <div className="dispute-party">
                        <img src={reported?.avatar} alt={reported?.name} className="dispute-avatar" />
                        <div>
                          <span className="dispute-party-label mono">REPORTED</span>
                          <span className="dispute-party-name">{reported?.name}</span>
                        </div>
                      </div>
                    </div>
                    {d.status !== 'resolved' && (
                      <div className="dispute-actions">
                        <Button variant="primary" size="sm">Resolve</Button>
                        <Button variant="danger" size="sm">Escalate</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
