import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, ChevronDown, ChevronUp, Share2, Ruler, Package, RotateCcw, Shield } from 'lucide-react';
import { fetchProduct, addRecentlyViewed } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { reviewAPI } from '../../services/api';
import ProductCard from '../../components/shop/ProductCard';
import { StarRating, ProductGridSkeleton } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, related, loading } = useSelector(s => s.product);
  const isWishlisted = useSelector(selectIsWishlisted(product?._id));
  const { isAuthenticated } = useSelector(s => s.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [openSection, setOpenSection] = useState('description');
  const [newReview, setNewReview] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    dispatch(fetchProduct(slug));
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  useEffect(() => {
    if (!product) return;
    dispatch(addRecentlyViewed({ _id: product._id, name: product.name, slug: product.slug, price: product.price, images: product.images, ratings: product.ratings }));
    // Auto-select first color/size
    if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    // Load reviews
    setReviewsLoading(true);
    reviewAPI.getAll({ product: product._id })
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [product, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please log in'); navigate('/login'); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    if (product.stock === 0) return;
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity, size: selectedSize, color: selectedColor }));
    setAdding(false);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please log in to write a review'); return; }
    if (!newReview.title || !newReview.body) { toast.error('Please fill in all fields'); return; }
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create({ ...newReview, product: product._id });
      setReviews(prev => [res.data.review, ...prev]);
      setNewReview({ rating: 5, title: '', body: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const discountPercent = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (loading || !product) {
    return (
      <div className="pt-24 page-container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] skeleton" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square skeleton" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-6 w-2/3" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-6 w-1/3" />
            <div className="skeleton h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} — LUXE Fashion</title>
        <meta name="description" content={product.shortDescription || product.description?.slice(0, 155)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.images?.[0]?.url} />
      </Helmet>

      <div className="pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="page-container mb-8">
          <nav className="text-xs text-luxe-muted">
            <Link to="/" className="hover:text-luxe-black">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-luxe-black">Shop</Link>
            <span className="mx-2">/</span>
            <Link to={`/shop?gender=${product.gender}`} className="hover:text-luxe-black capitalize">{product.gender}</Link>
            <span className="mx-2">/</span>
            <span className="text-luxe-black">{product.name}</span>
          </nav>
        </div>

        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
            {/* ── Image Gallery ─────────────────────────────────────── */}
            <div className="space-y-3">
              {/* Main image with zoom */}
              <div
                className="relative aspect-[3/4] bg-luxe-cream overflow-hidden cursor-crosshair"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={product.images?.[selectedImage]?.url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ${zoomActive ? 'scale-150' : 'scale-100'}`}
                  style={zoomActive ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNewArrival && <span className="badge-black">New</span>}
                  {product.isLimitedEdition && <span className="badge-gold">Limited Edition</span>}
                  {discountPercent > 0 && <span className="badge-red">-{discountPercent}%</span>}
                </div>
                {/* Share */}
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="absolute top-4 right-4 w-9 h-9 bg-white shadow flex items-center justify-center hover:bg-luxe-cream transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square overflow-hidden border-2 transition-colors ${
                        selectedImage === i ? 'border-luxe-black' : 'border-transparent hover:border-luxe-border'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Details ───────────────────────────────────── */}
            <div>
              <p className="text-2xs tracking-widest uppercase text-luxe-muted mb-2">{product.brand}</p>
              <h1 className="font-display text-3xl md:text-4xl font-medium text-luxe-black leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {product.ratings?.count > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={product.ratings.average} count={product.ratings.count} size="md" />
                  <a href="#reviews" className="text-xs text-luxe-muted underline">Read reviews</a>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-3xl font-semibold text-luxe-black">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.comparePrice > product.price && (
                  <>
                    <span className="text-xl text-luxe-muted line-through">₹{product.comparePrice.toLocaleString()}</span>
                    <span className="badge-red text-sm">{discountPercent}% OFF</span>
                  </>
                )}
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="text-luxe-muted leading-relaxed mb-6">{product.shortDescription}</p>
              )}

              {/* Color selection */}
              {product.colors?.length > 0 && (
                <div className="mb-5">
                  <label className="input-label">Color: <span className="font-normal normal-case tracking-normal">{selectedColor}</span></label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-xs border transition-colors ${
                          selectedColor === color ? 'bg-luxe-black text-white border-luxe-black' : 'border-luxe-border hover:border-luxe-black'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selection */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="input-label">Size: <span className="font-normal normal-case tracking-normal">{selectedSize || 'Select a size'}</span></label>
                    <button className="text-2xs text-luxe-muted underline flex items-center gap-1">
                      <Ruler size={11} /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => {
                      const variant = product.variants?.find(v => v.size === size && v.color === selectedColor);
                      const outOfStock = variant ? variant.stock === 0 : false;
                      return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          className={`w-12 h-10 text-sm border transition-colors relative ${
                            selectedSize === size
                              ? 'bg-luxe-black text-white border-luxe-black'
                              : outOfStock
                              ? 'border-luxe-border text-luxe-border cursor-not-allowed'
                              : 'border-luxe-border hover:border-luxe-black'
                          }`}
                        >
                          {outOfStock && <span className="absolute inset-0 flex items-center justify-center"><span className="w-full h-px bg-gray-300 absolute rotate-45" /></span>}
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-luxe-border">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-luxe-cream transition-colors text-lg">−</button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-luxe-cream transition-colors text-lg">+</button>
                </div>
                <span className="text-xs text-luxe-muted">
                  {product.stock > 0 ? `${product.stock} in stock` : <span className="text-red-500">Out of stock</span>}
                </span>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="btn-primary flex-1 justify-center gap-2 py-4"
                >
                  <ShoppingBag size={16} />
                  {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Bag'}
                </button>
                <button
                  onClick={() => { if (!isAuthenticated) { toast.error('Please log in'); navigate('/login'); return; } dispatch(toggleWishlist(product._id)); }}
                  className={`w-14 h-14 border flex items-center justify-center transition-colors ${
                    isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-luxe-border hover:border-luxe-black'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-luxe-border">
                {[
                  { icon: Package, title: 'Free Delivery', sub: 'On orders ₹999+' },
                  { icon: RotateCcw, title: 'Easy Returns', sub: '7-day return policy' },
                  { icon: Shield, title: 'Secure Payment', sub: 'SSL encrypted' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex flex-col items-center text-center gap-1">
                    <Icon size={20} className="text-luxe-gold" />
                    <p className="text-xs font-medium">{title}</p>
                    <p className="text-2xs text-luxe-muted">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Accordion sections */}
              {[
                { key: 'description', title: 'Description', content: product.description },
                { key: 'material', title: 'Material & Care', content: product.material ? `${product.material}\n\n${product.careInstructions?.join('\n') || ''}` : null },
                { key: 'specs', title: 'Specifications', content: product.specifications?.length ? product.specifications.map(s => `${s.key}: ${s.value}`).join('\n') : null },
              ].filter(s => s.content).map(section => (
                <div key={section.key} className="border-t border-luxe-border">
                  <button
                    onClick={() => setOpenSection(openSection === section.key ? '' : section.key)}
                    className="flex items-center justify-between w-full py-4 text-sm font-medium"
                  >
                    {section.title}
                    {openSection === section.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <AnimatePresence>
                    {openSection === section.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 text-sm text-luxe-muted leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reviews ─────────────────────────────────────────────── */}
          <section id="reviews" className="mt-20 border-t border-luxe-border pt-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-tag">Customer Reviews</span>
                <h2 className="font-display text-3xl font-medium">Ratings & Reviews</h2>
              </div>
              {product.ratings?.count > 0 && (
                <div className="text-center">
                  <div className="font-display text-5xl font-semibold">{product.ratings.average.toFixed(1)}</div>
                  <StarRating rating={product.ratings.average} size="lg" showCount={false} />
                  <p className="text-xs text-luxe-muted">{product.ratings.count} reviews</p>
                </div>
              )}
            </div>

            {/* Write review */}
            {isAuthenticated && (
              <div className="bg-luxe-bg-soft p-6 mb-10">
                <h3 className="text-sm font-medium mb-4 tracking-wider uppercase">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="input-label">Rating</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setNewReview(r => ({ ...r, rating: star }))}
                          className={`text-2xl transition-colors ${star <= newReview.rating ? 'text-luxe-gold' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Review Title</label>
                    <input type="text" value={newReview.title} onChange={e => setNewReview(r => ({ ...r, title: e.target.value }))} className="input-field" placeholder="Summarize your experience" required />
                  </div>
                  <div>
                    <label className="input-label">Review</label>
                    <textarea value={newReview.body} onChange={e => setNewReview(r => ({ ...r, body: e.target.value }))} className="input-field min-h-[100px] resize-none" placeholder="Share details of your experience" required />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn-primary">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Review list */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded" />)}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-luxe-muted text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id} className="border-b border-luxe-border pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-luxe-cream flex items-center justify-center font-medium text-sm">
                          {review.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.user?.name}</p>
                          <StarRating rating={review.rating} size="sm" showCount={false} />
                        </div>
                      </div>
                      <div className="text-right">
                        {review.isVerifiedPurchase && (
                          <span className="badge bg-green-50 text-green-700 text-2xs">Verified Purchase</span>
                        )}
                        <p className="text-2xs text-luxe-muted mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">{review.title}</h4>
                    <p className="text-sm text-luxe-muted leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Related Products ─────────────────────────────────────── */}
          {related.length > 0 && (
            <section className="mt-20">
              <div className="text-center mb-10">
                <span className="section-tag">You May Also Like</span>
                <h2 className="section-title">Related Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
