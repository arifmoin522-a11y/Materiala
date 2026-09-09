import { createContext, useContext, useState, useEffect } from 'react';
import { USERS, DEMO_ACCOUNTS } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ase_user');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); }
      catch { localStorage.removeItem('ase_user'); }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const account = DEMO_ACCOUNTS.find(
      a => a.email === email && a.password === password
    );
    if (!account) return { success: false, error: 'Invalid email or password.' };

    const user = USERS.find(u => u.id === account.userId);
    if (!user) return { success: false, error: 'User not found.' };

    setCurrentUser(user);
    localStorage.setItem('ase_user', JSON.stringify(user));
    return { success: true, user };
  };

  const register = (name, email, password, city) => {
    // Check if email already exists
    if (DEMO_ACCOUNTS.some(a => a.email === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create new user (in-memory only for demo)
    const newUser = {
      id: `u${Date.now()}`,
      name,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      city,
      bio: '',
      rating: null,
      totalListings: 0,
      totalSold: 0,
      joinedAt: new Date().toISOString().slice(0, 7),
      isAdmin: false,
      role: 'buyer',
    };

    setCurrentUser(newUser);
    localStorage.setItem('ase_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ase_user');
  };

  const value = { currentUser, login, register, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
