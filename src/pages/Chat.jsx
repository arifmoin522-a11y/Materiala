import { useState, useRef, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import './Chat.css';

export default function Chat() {
  const { currentUser } = useAuth();
  const { conversations, sendMessage } = useApp();
  const [searchParams] = useSearchParams();
  const [activeConvId, setActiveConvId] = useState(searchParams.get('conv') || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  if (!currentUser) return <Navigate to="/auth" replace />;

  const myConvs = conversations.filter(c => c.participants.includes(currentUser.id));
  
  // Resolve active conversation: URL param takes priority, then first in list
  const convParam = searchParams.get('conv');
  const activeConv = myConvs.find(c => c.id === (activeConvId || convParam)) || myConvs[0];

  useEffect(() => {
    const param = searchParams.get('conv');
    if (param) {
      setActiveConvId(param);
    } else if (myConvs.length > 0 && !activeConvId) {
      setActiveConvId(myConvs[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, myConvs.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages?.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputText.trim(), currentUser.id);
    setInputText('');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getOther = (conv) => {
    const otherId = conv.participants.find(p => p !== currentUser.id);
    return getUserById(otherId);
  };

  return (
    <div className="chat-page page-enter">
      {/* ── CONVERSATION LIST ── */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar__header">
          <h1 className="heading" style={{ fontSize: 'var(--text-md)', color: 'var(--color-charcoal)' }}>Messages</h1>
          <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)' }}>{myConvs.length} conversations</span>
        </div>

        <div className="conv-list">
          {myConvs.length === 0 ? (
            <div className="conv-list__empty">
              <span>No conversations yet.</span>
              <p>Start by messaging a seller on a product page.</p>
            </div>
          ) : (
            myConvs.map(conv => {
              const other = getOther(conv);
              const isActive = conv.id === activeConv?.id;
              return (
                <button
                  key={conv.id}
                  className={`conv-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveConvId(conv.id)}
                  id={`conv-${conv.id}`}
                >
                  <div className="conv-item__avatar-wrap">
                    <img src={other?.avatar} alt={other?.name} className="conv-item__avatar" />
                    {conv.unreadCount > 0 && (
                      <span className="conv-item__unread">{conv.unreadCount}</span>
                    )}
                  </div>
                  <div className="conv-item__info">
                    <div className="conv-item__top">
                      <span className="conv-item__name heading">{other?.name}</span>
                      <span className="conv-item__time mono">{formatDate(conv.lastMessageAt)}</span>
                    </div>
                    <span className="conv-item__product">Re: {conv.productName}</span>
                    <span className="conv-item__last">{conv.lastMessage}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── CHAT WINDOW ── */}
      <main className="chat-window">
        {!activeConv ? (
          <div className="chat-window__empty">
            <span style={{ fontSize: '48px' }}>💬</span>
            <h2 className="heading">Select a conversation</h2>
            <p>Choose a conversation from the left to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-window__header">
              {(() => {
                const other = getOther(activeConv);
                return (
                  <div className="chat-header-user">
                    <img src={other?.avatar} alt={other?.name} className="chat-header-avatar" />
                    <div>
                      <span className="chat-header-name heading">{other?.name}</span>
                      <span className="chat-header-city mono">{other?.city}</span>
                    </div>
                  </div>
                );
              })()}
              <div className="chat-window__product-ref">
                <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-40)' }}>Regarding:</span>
                <span className="chat-window__product-name">{activeConv.productName}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {activeConv.messages.map((msg, i) => {
                const isMe = msg.senderId === currentUser.id;
                const sender = getUserById(msg.senderId);
                return (
                  <div key={msg.id} className={`message ${isMe ? 'message--mine' : 'message--theirs'}`}>
                    {!isMe && (
                      <img src={sender?.avatar} alt={sender?.name} className="message__avatar" />
                    )}
                    <div className="message__bubble">
                      <p className="message__text">{msg.text}</p>
                      <span className="message__time mono">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-area" onSubmit={handleSend}>
              <input
                id="chat-message-input"
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                autoComplete="off"
                aria-label="Message input"
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputText.trim()}
                aria-label="Send message"
                id="chat-send-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
