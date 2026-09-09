import { createContext, useContext, useState } from 'react';
import { PRODUCTS } from '../data/products';
import { CONVERSATIONS } from '../data/chats';
import { SWAP_REQUESTS } from '../data/swaps';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [swapRequests, setSwapRequests] = useState(SWAP_REQUESTS);
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ase_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState([]);

  const saveItem = (productId) => {
    setSavedItems(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('ase_saved', JSON.stringify(next));
      return next;
    });
  };

  const addProduct = (product) => {
    const newProduct = {
      quantity: 1,
      condition: 'Used',
      canBuy: true,
      canSwap: false,
      ...product,
      id: `p${Date.now()}`,
      listedAt: new Date().toISOString().slice(0, 10),
      status: 'available',
      views: 0,
      saves: 0,
      featured: false,
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const sendMessage = (conversationId, text, senderId) => {
    const msg = { id: `m${Date.now()}`, senderId, text, timestamp: new Date().toISOString(), type: 'text' };
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastMessageAt: msg.timestamp }
        : c
    ));
  };

  const startConversation = (sellerId, productId, productName, buyerId = 'demo') => {
    const existing = conversations.find(c =>
      c.participants.includes(sellerId) &&
      c.participants.includes(buyerId) &&
      c.productId === productId
    );
    if (existing) return existing.id;
    const newConv = {
      id: `conv${Date.now()}`,
      participants: [buyerId, sellerId],
      productId,
      productName,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    return newConv.id;
  };

  const updateSwap = (id, status) => {
    setSwapRequests(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const addSwapRequest = (swap) => {
    const newSwap = { ...swap, id: `sw${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' };
    setSwapRequests(prev => [newSwap, ...prev]);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const value = {
    products, addProduct, updateProduct, deleteProduct,
    conversations, sendMessage, startConversation,
    swapRequests, updateSwap, addSwapRequest,
    savedItems, saveItem,
    toasts, showToast, dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
