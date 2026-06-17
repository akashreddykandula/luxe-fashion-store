// ── WishlistPage.jsx ──────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import ProductCard from '../../components/shop/ProductCard';

export function WishlistPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <>
      <Helmet><title>My Wishlist — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-medium">My Wishlist</h1>
          <p className="text-luxe-muted text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={56} className="text-luxe-border mb-4" />
            <h3 className="font-display text-2xl font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-luxe-muted text-sm mb-6">Save items you love for later</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export default WishlistPage;
