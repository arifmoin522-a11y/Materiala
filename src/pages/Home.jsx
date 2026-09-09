import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/product/ProductCard';
import { useScrollRevealAll } from '../hooks/useScrollReveal';
import './Home.css';

const CITIES_DATA = [
  { city: 'Delhi',     count: 3, distance: 'Local' },
  { city: 'Mumbai',    count: 4, distance: '1,400 km' },
  { city: 'Bengaluru', count: 3, distance: '2,000 km' },
  { city: 'Hyderabad', count: 2, distance: '1,800 km' },
  { city: 'Chennai',   count: 2, distance: '2,200 km' },
  { city: 'Jaipur',    count: 2, distance: '280 km' },
  { city: 'Pune',      count: 1, distance: '1,700 km' },
];

export default function Home() {
  const { products } = useApp();
  useScrollRevealAll();
  const [heroVisible, setHeroVisible] = useState(false);

  const featured = products.filter(p => p.featured && p.status === 'available').slice(0, 6);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="home">
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero section">
        <div className="hero__bg-pattern" aria-hidden="true" />
        <div className="container hero__inner">
          <div className={`hero__content ${heroVisible ? 'hero--visible' : ''}`}>
            <span className="hero__eyebrow catalog-num mono">India's Art Material Marketplace / Est. 2026</span>
            <h1 className="hero__headline display">
              <span className="hero__line1">Give Art</span>
              <span className="hero__line2">Materials<em> a</em></span>
              <span className="hero__line3">Second Life.</span>
            </h1>
            <p className="hero__sub">
              Buy, sell and swap art supplies with creative people around you.<br />
              Every unused tube finds a new canvas.
            </p>
            <div className="hero__actions">
              <Link to="/marketplace" className="hero__cta-primary btn btn--lg btn--terracotta" id="hero-explore-btn">
                Explore Materials
              </Link>
              <Link to="/dashboard" className="hero__cta-secondary btn btn--lg btn--secondary" id="hero-list-btn">
                List an Item
              </Link>
            </div>
            <div className="hero__stats" aria-label="Platform statistics">
              <div className="hero__stat">
                <span className="hero__stat-num mono">15+</span>
                <span className="hero__stat-label">Active Listings</span>
              </div>
              <div className="hero__stat-div" aria-hidden="true" />
              <div className="hero__stat">
                <span className="hero__stat-num mono">8</span>
                <span className="hero__stat-label">Cities</span>
              </div>
              <div className="hero__stat-div" aria-hidden="true" />
              <div className="hero__stat">
                <span className="hero__stat-num mono">₹0</span>
                <span className="hero__stat-label">Commission</span>
              </div>
            </div>
          </div>

          <div className={`hero__visual ${heroVisible ? 'hero--visible' : ''}`} aria-hidden="true">
            <div className="hero__image-stack">
              <div className="hero__img-main">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&q=85"
                  alt="Artist workspace with paints and brushes"
                  width="700"
                  height="467"
                  fetchPriority="high"
                />
              </div>
              <div className="hero__img-float hero__img-float--1">
                <img src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=350&q=80" alt="Watercolors" width="350" height="233" loading="lazy" />
              </div>
              <div className="hero__img-float hero__img-float--2">
                <img src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&q=80" alt="Paintbrushes" width="300" height="200" loading="lazy" />
              </div>
              <div className="hero__label-card" aria-label="Featured listing preview">
                <span className="hero__label-tag mono">P001 / FEATURED</span>
                <span className="hero__label-name">Winsor & Newton Watercolor Set</span>
                <span className="hero__label-price mono">₹850</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero__scroll-hint" aria-hidden="true">
          <span className="mono">SCROLL</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* ── FEATURED LISTINGS ───────────────────────────── */}
      <section className="section home-listings bg-paper" aria-labelledby="listings-heading">
        <div className="container">
          <header className="section-header reveal">
            <span className="catalog-num mono">02 / MARKETPLACE</span>
            <h2 id="listings-heading" className="section-title display">
              Materials Looking for<br />a New Studio
            </h2>
            <p className="section-sub">
              Good materials deserve another creative life. Browse listings from artists across India.
            </p>
          </header>

          <div className="home-listings__grid">
            {featured.map((product, i) => (
              <div
                key={product.id}
                className={`reveal reveal-delay-${Math.min(i + 1, 5)}`}
              >
                <ProductCard product={product} variant={i === 0 ? 'featured' : 'default'} />
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: 'var(--sp-8)' }}>
            <Link to="/marketplace" className="btn btn--primary btn--lg" id="view-all-btn">
              View All Materials
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section className="section home-categories bg-charcoal" aria-labelledby="categories-heading">
        <div className="container">
          <header className="section-header reveal" style={{ color: 'var(--color-paper)' }}>
            <span className="catalog-num mono" style={{ color: 'rgba(245,240,232,0.4)' }}>03 / CATEGORIES</span>
            <h2 id="categories-heading" className="section-title display" style={{ color: 'var(--color-paper)' }}>
              What Are You<br />Looking For?
            </h2>
          </header>

          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <Link
                to={`/marketplace?category=${cat.id}`}
                key={cat.id}
                className={`category-item reveal reveal-delay-${Math.min((i % 5) + 1, 5)}`}
                id={`cat-${cat.id}`}
              >
                <span className="category-item__num mono">{cat.num}</span>
                <span className="category-item__label heading">{cat.label}</span>
                <svg className="category-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="section home-how bg-paper-light" aria-labelledby="how-heading">
        <div className="container">
          <header className="section-header reveal">
            <span className="catalog-num mono">04 / PROCESS</span>
            <h2 id="how-heading" className="section-title display">How It Works</h2>
          </header>

          <div className="how-grid">
            {[
              { num: '01', title: 'List', body: 'Photograph your unused art material and create a listing in minutes. Set your price or swap preference.', icon: '📸' },
              { num: '02', title: 'Discover', body: 'Search by category, location, condition, or price. Find exactly what you need for your next artwork.', icon: '🔍' },
              { num: '03', title: 'Connect', body: 'Talk directly with the seller. Negotiate, ask questions, and agree on exchange details.', icon: '💬' },
              { num: '04', title: 'Exchange', body: 'Buy or swap and give those materials another life. The canvas passes forward.', icon: '🎨' },
            ].map((step, i) => (
              <div className={`how-step reveal reveal-delay-${i + 1}`} key={step.num}>
                <div className="how-step__header">
                  <span className="how-step__num mono">{step.num}</span>
                  <span className="how-step__icon" aria-hidden="true">{step.icon}</span>
                </div>
                <div className="how-step__divider" />
                <h3 className="how-step__title heading">{step.title}</h3>
                <p className="how-step__body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUSTAINABILITY ───────────────────────────────── */}
      <section className="home-sustain bg-green section" aria-labelledby="sustain-heading">
        <div className="container">
          <div className="sustain__inner">
            <div className="sustain__text reveal">
              <span className="catalog-num mono" style={{ color: 'rgba(255,255,255,0.45)' }}>05 / SUSTAINABILITY</span>
              <h2 id="sustain-heading" className="section-title display" style={{ color: 'var(--color-paper)' }}>
                Your Unused Supplies<br />Are Still Full of<br /><em>Possibilities.</em>
              </h2>
              <p className="sustain__sub" style={{ color: 'rgba(245,240,232,0.75)' }}>
                Art materials shouldn't gather dust in a drawer. When you pass them forward,
                you make art more accessible, reduce waste, and strengthen the creative community
                around you.
              </p>
            </div>
            <div className="sustain__pillars reveal reveal-delay-2">
              {[
                { word: 'REUSE', desc: 'Give materials a second purpose' },
                { word: 'SAVE', desc: 'Spend less on what you need' },
                { word: 'CREATE', desc: 'Make more with less' },
                { word: 'SHARE', desc: 'Build a creative community' },
              ].map(p => (
                <div className="sustain__pillar" key={p.word}>
                  <span className="sustain__pillar-word heading">{p.word}</span>
                  <span className="sustain__pillar-desc">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCAL COMMUNITY ──────────────────────────────── */}
      <section className="section home-local bg-paper" aria-labelledby="local-heading">
        <div className="container">
          <header className="section-header reveal">
            <span className="catalog-num mono">06 / DISCOVER</span>
            <h2 id="local-heading" className="section-title display">Materials Near You</h2>
            <p className="section-sub">Listings from artists across Indian cities.</p>
          </header>

          <div className="city-strip reveal reveal-delay-1">
            {CITIES_DATA.map(({ city, count, distance }) => (
              <Link
                to={`/marketplace?city=${city}`}
                key={city}
                className="city-chip"
                id={`city-${city.toLowerCase()}`}
              >
                <span className="city-chip__name heading">{city}</span>
                <span className="city-chip__count mono">{count} listings</span>
                <span className="city-chip__dist mono">{distance}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="home-cta bg-charcoal" aria-labelledby="cta-heading">
        <div className="container">
          <div className="home-cta__inner reveal">
            <span className="catalog-num mono" style={{ color: 'rgba(245,240,232,0.3)' }}>07 / JOIN</span>
            <h2 id="cta-heading" className="home-cta__headline display">
              Don't Let Good<br />Materials End Up<br />in a Drawer.
            </h2>
            <p className="home-cta__sub">
              Buy less. Waste less. Create more. Pass it forward.
            </p>
            <div className="home-cta__actions">
              <Link to="/marketplace" className="btn btn--lg btn--terracotta" id="cta-find-btn">Find Materials</Link>
              <Link to="/dashboard" className="btn btn--lg btn--secondary" style={{ borderColor: 'rgba(245,240,232,0.4)', color: 'var(--color-paper)' }} id="cta-sell-btn">
                Sell Something
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
