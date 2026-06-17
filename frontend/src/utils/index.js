// ─── formatters.js ────────────────────────────────────────────────────────────

export const formatPrice = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date, options = {}) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    ...options,
  });

export const formatDateShort = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateShort(date);
};

export const formatOrderStatus = (status) =>
  status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const truncate = (str, len = 100) =>
  str?.length > len ? `${str.slice(0, len)}...` : str;

export const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// ─── validators.js ─────────────────────────────────────────────────────────────

export const isValidEmail = (email) =>
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

export const isValidPincode = (pin) =>
  /^[1-9][0-9]{5}$/.test(pin);

export const isStrongPassword = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
  score: [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length,
});

// ─── razorpay.js ──────────────────────────────────────────────────────────────

export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
        ...(options.modal || {}),
      },
    });
    rzp.on('payment.failed', (response) => reject(new Error(response.error?.description || 'Payment failed')));
    rzp.open();
  });
};

// ─── imageUtils.js ────────────────────────────────────────────────────────────

export const getCloudinaryUrl = (publicId, transforms = {}) => {
  const base = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const t = Object.entries({ f: 'auto', q: 'auto', ...transforms })
    .map(([k, v]) => `${k}_${v}`).join(',');
  return `${base}/${t}/${publicId}`;
};

export const getProductThumbnail = (url, width = 400) => {
  if (!url) return '';
  // For Unsplash images
  if (url.includes('unsplash.com')) return `${url.split('?')[0]}?w=${width}&q=80&auto=format`;
  return url;
};

// ─── seo.js ───────────────────────────────────────────────────────────────────

export const generateProductStructuredData = (product) => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images?.map(i => i.url) || [],
  brand: { '@type': 'Brand', name: product.brand || 'LUXE' },
  offers: {
    '@type': 'Offer',
    url: `${window.location.origin}/product/${product.slug}`,
    priceCurrency: 'INR',
    price: product.price,
    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  },
  aggregateRating: product.ratings?.count > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: product.ratings.average,
    reviewCount: product.ratings.count,
  } : undefined,
});

export const generateBreadcrumbStructuredData = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${window.location.origin}${item.url}`,
  })),
});

export default {
  formatPrice, formatDate, formatDateShort, formatRelativeTime,
  formatOrderStatus, truncate, slugify,
  isValidEmail, isValidPhone, isValidPincode, isStrongPassword,
  loadRazorpay, openRazorpayCheckout,
  getCloudinaryUrl, getProductThumbnail,
  generateProductStructuredData, generateBreadcrumbStructuredData,
};
