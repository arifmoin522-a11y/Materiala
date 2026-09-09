import './LoadingState.css';

export default function LoadingState({ message = 'Loading…', size = 'md' }) {
  return (
    <div className={`loading-state loading-state--${size}`} role="status" aria-live="polite">
      <span className="loading-state__spinner" aria-hidden="true" />
      {message && <span className="loading-state__message">{message}</span>}
    </div>
  );
}

export function LoadingGrid({ cols = 4, count = 8 }) {
  return (
    <div className="loading-grid" style={{ '--cols': cols }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="loading-card">
          <div className="loading-card__image skeleton" />
          <div className="loading-card__body">
            <div className="skeleton skeleton--line skeleton--wide" />
            <div className="skeleton skeleton--line skeleton--narrow" />
            <div className="skeleton skeleton--line skeleton--mid" />
          </div>
        </div>
      ))}
    </div>
  );
}
