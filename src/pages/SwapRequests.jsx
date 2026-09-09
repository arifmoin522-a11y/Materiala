import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import Button from '../components/ui/Button';
import './SwapRequests.css';

const TABS = ['Incoming', 'Outgoing', 'Active', 'Completed'];

const STATUS_MAP = {
  Incoming:  (s, uid) => s.status === 'pending' && s.receiverId === uid,
  Outgoing:  (s, uid) => s.status === 'pending' && s.requesterId === uid,
  Active:    s => s.status === 'accepted',
  Completed: s => s.status === 'completed' || s.status === 'rejected',
};

export default function SwapRequests() {
  const { currentUser } = useAuth();
  const { swapRequests, updateSwap, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('Incoming');

  if (!currentUser) return <Navigate to="/auth" replace />;

  const mySwaps = swapRequests.filter(
    s => s.requesterId === currentUser.id || s.receiverId === currentUser.id
  );

  const tabSwaps = mySwaps.filter(s => STATUS_MAP[activeTab]?.(s, currentUser.id));

  const handleAccept = (id) => {
    updateSwap(id, 'accepted');
    showToast('Swap request accepted!', 'success');
  };

  const handleReject = (id) => {
    updateSwap(id, 'rejected');
    showToast('Swap request declined.', 'info');
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const counts = {
    Incoming:  mySwaps.filter(s => STATUS_MAP.Incoming(s, currentUser.id)).length,
    Outgoing:  mySwaps.filter(s => STATUS_MAP.Outgoing(s, currentUser.id)).length,
    Active:    mySwaps.filter(s => STATUS_MAP.Active(s)).length,
    Completed: mySwaps.filter(s => STATUS_MAP.Completed(s)).length,
  };

  return (
    <div className="swap-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="swap-page__header">
          <span className="catalog-num mono">SWAP / REQUESTS</span>
          <h1 className="swap-page__title heading">Swap Requests</h1>
          <p className="swap-page__sub">Manage your material exchange proposals.</p>
        </div>

        {/* Tabs */}
        <div className="swap-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`swap-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`swap-tab-${tab.toLowerCase()}`}
            >
              {tab}
              {counts[tab] > 0 && <span className="swap-tab__count">{counts[tab]}</span>}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="swap-cards">
          {tabSwaps.length === 0 ? (
            <div className="swap-empty">
              <span style={{ fontSize: '36px' }}>⇄</span>
              <h3 className="heading">No {activeTab.toLowerCase()} requests</h3>
              <p>
                {activeTab === 'Incoming' ? "No one has requested a swap from you yet." :
                 activeTab === 'Outgoing' ? "You haven't sent any swap requests yet." :
                 'No exchanges in this category.'}
              </p>
            </div>
          ) : (
            tabSwaps.map(swap => {
              const requester = getUserById(swap.requesterId);
              const isIncoming = swap.receiverId === currentUser.id;

              return (
                <div key={swap.id} className={`swap-card swap-card--${swap.status}`}>
                  <div className="swap-card__header">
                    <div className="swap-card__user">
                      <img src={requester?.avatar} alt={requester?.name} className="swap-card__avatar" />
                      <div>
                        <span className="swap-card__name heading">{requester?.name}</span>
                        <span className="swap-card__city mono">{swap.location}</span>
                      </div>
                    </div>
                    <div className="swap-card__meta">
                      <span className={`swap-card__status swap-card__status--${swap.status}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                      <span className="swap-card__date mono">{formatDate(swap.createdAt)}</span>
                    </div>
                  </div>

                  {/* Items being exchanged */}
                  <div className="swap-card__items">
                    <div className="swap-item">
                      <img src={swap.offeredProductImage} alt={swap.offeredProductName} className="swap-item__img" />
                      <div className="swap-item__info">
                        <span className="swap-item__label mono">OFFERS</span>
                        <span className="swap-item__name">{swap.offeredProductName}</span>
                      </div>
                    </div>

                    <div className="swap-arrow">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>
                      </svg>
                    </div>

                    <div className="swap-item">
                      <img src={swap.requestedProductImage} alt={swap.requestedProductName} className="swap-item__img" />
                      <div className="swap-item__info">
                        <span className="swap-item__label mono">WANTS</span>
                        <span className="swap-item__name">{swap.requestedProductName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {swap.message && (
                    <div className="swap-card__message">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>"{swap.message}"</span>
                    </div>
                  )}

                  {/* Actions */}
                  {isIncoming && swap.status === 'pending' && (
                    <div className="swap-card__actions">
                      <Button variant="terracotta" size="sm" onClick={() => handleAccept(swap.id)} id={`accept-${swap.id}`}>
                        ✓ Accept Swap
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleReject(swap.id)} id={`reject-${swap.id}`}>
                        ✕ Decline
                      </Button>
                    </div>
                  )}

                  {!isIncoming && swap.status === 'pending' && (
                    <div className="swap-card__actions">
                      <span className="swap-card__waiting mono">Waiting for response...</span>
                      <Button variant="ghost" size="sm" onClick={() => handleReject(swap.id)}>Withdraw</Button>
                    </div>
                  )}

                  {swap.status === 'accepted' && (
                    <div className="swap-card__actions swap-card__actions--accepted">
                      <span className="swap-card__success">✓ Swap accepted! Coordinate with the other party to complete the exchange.</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button variant="primary" size="sm" onClick={() => { updateSwap(swap.id, 'completed'); showToast('Exchange marked complete!', 'success'); }}>
                          Mark as Completed
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
