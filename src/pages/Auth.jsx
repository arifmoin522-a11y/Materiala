import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../data/products';
import Button from '../components/ui/Button';
import './Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600)); // simulate network

    if (mode === 'login') {
      const result = login(form.email, form.password);
      if (result.success) navigate('/');
      else setError(result.error);
    } else {
      if (!form.name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      if (!form.city) { setError('Please select your city.'); setLoading(false); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      const result = register(form.name, form.email, form.password, form.city);
      if (result.success) navigate('/');
      else setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left Panel — artwork */}
      <div className="auth-panel auth-panel--art" aria-hidden="true">
        <div className="auth-panel__overlay" />
        <img
          src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&q=85"
          alt=""
          className="auth-panel__bg"
        />
        <div className="auth-panel__content">
          <Link to="/" className="auth-panel__logo">
            <span className="auth-panel__logo-mark">ASE</span>
            <span className="auth-panel__logo-text">Art Supply<br/>Exchange</span>
          </Link>
          <blockquote className="auth-panel__quote display">
            "Someone else's unused material can become your next artwork."
          </blockquote>
          <p className="auth-panel__sub">
            Join India's creative circular marketplace.
          </p>
          <div className="auth-panel__demo-hint">
            <span className="mono" style={{ fontSize: 'var(--text-xs)', opacity: 0.55 }}>Demo accounts:</span>
            <code className="auth-panel__demo-code">demo@artsupply.in / demo1234</code>
            <code className="auth-panel__demo-code">admin@artsupply.in / admin1234</code>
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-wrap">
          <div className="auth-form__header">
            <div className="auth-toggle">
              <button
                className={`auth-toggle__btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
                id="tab-login"
              >Sign In</button>
              <button
                className={`auth-toggle__btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError(''); }}
                id="tab-register"
              >Create Account</button>
            </div>
          </div>

          <h1 className="auth-form__title heading">
            {mode === 'login' ? 'Welcome back.' : 'Join the community.'}
          </h1>
          <p className="auth-form__sub">
            {mode === 'login'
              ? 'Sign in to browse and manage your listings.'
              : 'Create a free account and start exchanging art materials.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="auth-name" className="form-label">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Priya Krishnaswamy"
                  className="form-input"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">Email</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@art.in"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-password" className="form-label">Password</label>
              <input
                id="auth-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="auth-city" className="form-label">City</label>
                <select
                  id="auth-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select your city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {error && (
              <div className="auth-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="terracotta"
              size="lg"
              fullWidth
              loading={loading}
              id="auth-submit-btn"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <p className="auth-form__switch">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="auth-form__switch-link"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
