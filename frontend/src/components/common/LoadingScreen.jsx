// LoadingScreen.jsx
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="font-display text-3xl font-semibold tracking-widest text-luxe-black mb-4 animate-pulse">
          LUXE
        </div>
        <div className="w-8 h-0.5 bg-luxe-gold mx-auto animate-pulse" />
      </div>
    </div>
  );
}
export default LoadingScreen;

// Skeleton.jsx
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] skeleton mb-3" />
      <div className="skeleton h-3 w-16 mb-2" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-20" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

// StarRating.jsx
export function StarRating({ rating, count, size = 'sm', showCount = true }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`${sizes[size]} ${star <= Math.round(rating) ? 'text-luxe-gold' : 'text-gray-200'}`}
          >
            ★
          </span>
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-luxe-muted">({count})</span>
      )}
      {showCount && count === undefined && (
        <span className="text-xs text-luxe-muted">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// Pagination.jsx
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const p = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) p.push(i);
    } else {
      p.push(1);
      if (page > 3) p.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) p.push(i);
      if (page < pages - 2) p.push('...');
      p.push(pages);
    }
    return p;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-12">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm border border-luxe-border hover:border-luxe-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ←
      </button>
      {getPages().map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '...'}
          className={`w-9 h-9 text-sm transition-colors ${
            p === page
              ? 'bg-luxe-black text-white'
              : p === '...'
              ? 'text-luxe-muted cursor-default'
              : 'border border-luxe-border hover:border-luxe-black'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-2 text-sm border border-luxe-border hover:border-luxe-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
  );
}

// EmptyState.jsx
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon size={56} className="text-luxe-border mb-4" />}
      <h3 className="font-display text-2xl font-medium text-luxe-black mb-2">{title}</h3>
      {description && <p className="text-luxe-muted text-sm mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// Badge component
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gold: 'bg-luxe-gold/10 text-luxe-gold',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-sm ${variants[variant]}`}>
      {children}
    </span>
  );
}

// OrderStatusBadge
export function OrderStatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    processing: { label: 'Processing', variant: 'info' },
    shipped: { label: 'Shipped', variant: 'info' },
    out_for_delivery: { label: 'Out for Delivery', variant: 'info' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    return_requested: { label: 'Return Requested', variant: 'warning' },
    returned: { label: 'Returned', variant: 'default' },
    refunded: { label: 'Refunded', variant: 'default' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

// SectionHeader
export function SectionHeader({ tag, title, subtitle, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      {tag && <span className="section-tag">{tag}</span>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="mt-3 text-luxe-muted max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}
