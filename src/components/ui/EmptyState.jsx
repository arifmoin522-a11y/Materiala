import './EmptyState.css';

const PRESETS = {
  listings:  { icon: '🖼️',  title: 'No listings yet',       sub: 'Your listed items will appear here.' },
  saved:     { icon: '🩷',  title: 'Nothing saved yet',      sub: 'Tap the heart on any listing to save it.' },
  swaps:     { icon: '⇄',   title: 'No swap requests',       sub: 'Swap requests you send and receive will appear here.' },
  chat:      { icon: '💬',  title: 'No conversations yet',   sub: 'Message a seller to start a conversation.' },
  search:    { icon: '🔍',  title: 'No results found',       sub: 'Try adjusting your search or filters.' },
  generic:   { icon: '📦',  title: 'Nothing here yet',       sub: 'This section is empty.' },
};

export default function EmptyState({ preset = 'generic', icon, title, sub, action }) {
  const cfg = PRESETS[preset] || PRESETS.generic;
  return (
    <div className="empty-state-block">
      <span className="empty-state-block__icon" role="img" aria-hidden="true">
        {icon || cfg.icon}
      </span>
      <h3 className="empty-state-block__title heading">{title || cfg.title}</h3>
      <p className="empty-state-block__sub">{sub || cfg.sub}</p>
      {action && <div className="empty-state-block__action">{action}</div>}
    </div>
  );
}
