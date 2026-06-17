import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const { isAuthenticated } = useSelector(s => s.auth);
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const mainImage = product.images?.[imgIdx]?.url || product.images?.[0]?.url;
  const hoverImage = product.images?.[1]?.url;
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to use wishlist');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to add to cart');
      navigate('/login');
      return;
    }
    // If product has variants, navigate to product page
    if (product.sizes?.length > 0) {
      navigate(`/product/${product.slug}`);
      return;
    }
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="product-card-img relative aspect-[3/4] bg-luxe-cream overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onMouseEnter={() => hoverImage && setImgIdx(1)}
            onMouseLeave={() => setImgIdx(0)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewArrival && <span className="badge-black">New</span>}
            {product.isLimitedEdition && <span className="badge-gold">Limited</span>}
            {discountPercent > 0 && <span className="badge-red">-{discountPercent}%</span>}
            {product.stock === 0 && <span className="badge bg-gray-500 text-white">Sold Out</span>}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 flex items-center justify-center bg-white shadow-md hover:bg-luxe-cream transition-colors ${
                isWishlisted ? 'text-red-500' : 'text-luxe-black'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/product/${product.slug}`}
              className="w-9 h-9 flex items-center justify-center bg-white shadow-md hover:bg-luxe-cream transition-colors"
              aria-label="Quick view"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Quick add — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={adding || product.stock === 0}
              className="w-full bg-luxe-black text-white py-3 text-2xs tracking-widest uppercase font-medium hover:bg-luxe-charcoal transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              {product.stock === 0 ? 'Sold Out' : adding ? 'Adding...' : product.sizes?.length > 0 ? 'Select Size' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="pt-3 pb-1">
          {product.brand && (
            <p className="text-2xs tracking-widest uppercase text-luxe-muted mb-0.5">{product.brand}</p>
          )}
          <h3 className="text-sm font-medium text-luxe-black leading-snug group-hover:text-luxe-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-semibold text-luxe-black">
              ₹{product.price.toLocaleString()}
            </span>
            {product.comparePrice > product.price && (
              <span className="text-xs text-luxe-muted line-through">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-xs ${s <= Math.round(product.ratings.average) ? 'text-luxe-gold' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <span className="text-2xs text-luxe-muted">({product.ratings.count})</span>
            </div>
          )}
          {/* Color swatches */}
          {product.colors?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  title={color}
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-2xs text-luxe-muted">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
