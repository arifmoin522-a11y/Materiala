import './Badge.css';

const CONDITION_CONFIG = {
  'Like New':      { variant: 'green',     label: 'Like New' },
  'Lightly Used':  { variant: 'blue',      label: 'Lightly Used' },
  'Used':          { variant: 'mustard',   label: 'Used' },
  'Heavily Used':  { variant: 'orange',    label: 'Heavily Used' },
  'Unused / Sealed': { variant: 'green',   label: 'Sealed' },
};

const STATUS_CONFIG = {
  'available': { variant: 'green',   label: 'Available' },
  'pending':   { variant: 'mustard', label: 'Pending' },
  'sold':      { variant: 'orange',  label: 'Sold' },
  'inactive':  { variant: 'grey',    label: 'Inactive' },
};

export function ConditionBadge({ condition }) {
  const config = CONDITION_CONFIG[condition] || { variant: 'grey', label: condition };
  return <span className={`badge badge--${config.variant}`}>{config.label}</span>;
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { variant: 'grey', label: status };
  return <span className={`badge badge--${config.variant} badge--status`}>{config.label}</span>;
}

export function SwapBadge() {
  return <span className="badge badge--swap">⇄ Swap</span>;
}

export function CategoryBadge({ label }) {
  return <span className="badge badge--category">{label}</span>;
}

export default function Badge({ children, variant = 'grey' }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
