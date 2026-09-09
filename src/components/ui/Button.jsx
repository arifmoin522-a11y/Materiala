import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  as: Tag = 'button',
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    loading ? 'btn--loading' : '',
    fullWidth ? 'btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : null}
      <span className={loading ? 'btn__text--hidden' : ''}>{children}</span>
    </Tag>
  );
}
