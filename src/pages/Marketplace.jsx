import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CONDITIONS, CITIES } from '../data/products';
import ProductCard from '../components/product/ProductCard';
import { useScrollRevealAll } from '../hooks/useScrollReveal';
import './Marketplace.css';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'popular', label: 'Most Viewed' },
];

export default function Marketplace() {
  const { products } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedCity     = searchParams.get('city') || 'all';
  const selectedCondition= searchParams.get('condition') || 'all';
  const swapOnly         = searchParams.get('swap') === 'true';
  const sortBy           = searchParams.get('sort') || 'newest';

  useScrollRevealAll();

  // Keep local search input in sync if URL param changes
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) next.set('search', val);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next);
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'false') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...products];

    const activeQuery = searchQuery || urlSearch;
    if (activeQuery.trim()) {
      const q = activeQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') list = list.filter(p => p.category === selectedCategory);
    if (selectedCity !== 'all')     list = list.filter(p => p.city === selectedCity);
    if (selectedCondition !== 'all') list = list.filter(p => p.condition === selectedCondition);
    if (swapOnly) list = list.filter(p => p.canSwap);

    switch (sortBy) {
      case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
      case 'price-desc': list.sort((a,b) => b.price - a.price); break;
      case 'popular':    list.sort((a,b) => b.views - a.views); break;
      default:           list.sort((a,b) => new Date(b.listedAt) - new Date(a.listedAt));
    }

    return list;
  }, [products, searchQuery, urlSearch, selectedCategory, selectedCity, selectedCondition, swapOnly, sortBy]);

  const clearAll = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const activeFilters = [selectedCategory, selectedCity, selectedCondition]
    .filter(v => v && v !== 'all').length + (swapOnly ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="marketplace page-enter">
      {/* ── PAGE HEADER ── */}
      <div className="marketplace__header bg-charcoal">
        <div className="container">
          <span className="catalog-num mono" style={{ color: 'rgba(245,240,232,0.35)' }}>01 / BROWSE</span>
          <h1 className="marketplace__title display">The Material Market</h1>
          <p className="marketplace__sub">Good materials deserve another studio.</p>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="marketplace__search-bar bg-surface">
        <div className="container">
          <div className="search-row">
            <div className="search-field-wrap">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="marketplace-search"
                type="search"
                className="search-field"
                placeholder="Search paints, canvas, brushes, paper, markers..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                aria-label="Search art supplies"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={clearSearch}
                  aria-label="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="search-controls">
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={e => setParam('sort', e.target.value)}
                aria-label="Sort listings"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <button
                className={`filter-toggle ${filterOpen ? 'active' : ''}`}
                onClick={() => setFilterOpen(o => !o)}
                aria-expanded={filterOpen}
                id="filter-toggle-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filters
                {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="marketplace__category-pills" role="toolbar" aria-label="Category quick filters">
            <button
              className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setParam('category', 'all')}
            >
              All Items
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`cat-pill ${selectedCategory === c.id ? 'active' : ''}`}
                onClick={() => setParam('category', selectedCategory === c.id ? 'all' : c.id)}
              >
                <span className="cat-pill__icon">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Filters panel */}
          {filterOpen && (
            <div className="filters-panel" role="region" aria-label="Filters">
              <div className="filters-grid">
                <div className="filter-group">
                  <label htmlFor="cat-filter" className="filter-label">Category</label>
                  <select id="cat-filter" className="form-input" value={selectedCategory} onChange={e => setParam('category', e.target.value)}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="city-filter" className="filter-label">City</label>
                  <select id="city-filter" className="form-input" value={selectedCity} onChange={e => setParam('city', e.target.value)}>
                    <option value="all">All Cities</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="cond-filter" className="filter-label">Condition</label>
                  <select id="cond-filter" className="form-input" value={selectedCondition} onChange={e => setParam('condition', e.target.value)}>
                    <option value="all">Any Condition</option>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Exchange Option</label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      id="swap-filter"
                      checked={swapOnly}
                      onChange={e => setParam('swap', e.target.checked ? 'true' : '')}
                    />
                    <span>Swap available only</span>
                  </label>
                </div>
              </div>
              {activeFilters > 0 && (
                <button className="clear-filters" onClick={clearAll}>
                  Reset All Filters ({activeFilters})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="marketplace__body">
        <div className="container">
          <div className="results-meta">
            <span className="results-count mono">
              {filtered.length} material{filtered.length !== 1 ? 's' : ''} found
              {(searchQuery || urlSearch) && <span className="results-query"> for "{searchQuery || urlSearch}"</span>}
            </span>
            {activeFilters > 0 && (
              <button className="results-reset-link mono" onClick={clearAll}>
                Clear filters ✕
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon">🎨</span>
              <h3 className="heading">No materials found</h3>
              <p>Try adjusting your keyword search or filter criteria.</p>
              <button className="btn btn--secondary" onClick={clearAll}>Reset Search & Filters</button>
            </div>
          ) : (
            <div className="marketplace__grid">
              {filtered.map((product, i) => (
                <div key={product.id} className={`reveal reveal-delay-${Math.min((i % 5) + 1, 5)}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
