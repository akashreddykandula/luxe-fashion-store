import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight, Bookmark } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, saveForLater, applyCoupon, removeCoupon, selectCartItems, selectSavedItems, selectCartSubtotal } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, coupon } = useSelector(s => s.cart);
  const items = useSelector(selectCartItems);
  const savedItems = useSelector(selectSavedItems);
  const subtotal = useSelector(selectCartSubtotal);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = coupon?.discount || 0;
  const tax = Math.round(subtotal * 0.18);
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await dispatch(applyCoupon(couponInput.trim()));
    setCouponLoading(false);
    setCouponInput('');
  };

  return (
    <>
      <Helmet><title>Shopping Cart — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container">
        <h1 className="font-display text-3xl font-medium mb-8">Shopping Bag</h1>

        {loading && items.length === 0 ? (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-28 skeleton" />)}
            </div>
            <div className="h-64 skeleton" />
          </div>
        ) : items.length === 0 && savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={56} className="text-luxe-border mb-4" />
            <h3 className="font-display text-2xl font-medium mb-2">Your bag is empty</h3>
            <p className="text-luxe-muted text-sm mb-6">Add some items to get started</p>
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            {/* Items */}
            <div>
              {items.length > 0 && (
                <div className="space-y-0 border border-luxe-border">
                  {items.map((item, idx) => {
                    const product = item.product || {};
                    const image = item.image || product.images?.[0]?.url;
                    const name = item.name || product.name;
                    const price = item.price || product.price || 0;
                    return (
                      <div key={item._id} className={`flex gap-5 p-5 ${idx < items.length - 1 ? 'border-b border-luxe-border' : ''}`}>
                        <Link to={`/product/${product.slug || ''}`} className="flex-shrink-0 w-24 h-32 bg-luxe-cream overflow-hidden">
                          {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <Link to={`/product/${product.slug || ''}`} className="text-sm font-medium hover:text-luxe-gold transition-colors line-clamp-2">{name}</Link>
                            <button onClick={() => dispatch(removeFromCart(item._id))} className="flex-shrink-0 text-luxe-muted hover:text-red-500 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                          <div className="flex gap-3 text-xs text-luxe-muted mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>· Color: {item.color}</span>}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-luxe-border">
                              <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))} className="w-8 h-8 flex items-center justify-center hover:bg-luxe-cream transition-colors"><Minus size={12} /></button>
                              <span className="w-10 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))} disabled={item.quantity >= 10} className="w-8 h-8 flex items-center justify-center hover:bg-luxe-cream transition-colors disabled:opacity-30"><Plus size={12} /></button>
                            </div>
                            <p className="text-sm font-semibold">₹{(price * item.quantity).toLocaleString()}</p>
                          </div>
                          <button onClick={() => dispatch(saveForLater(item._id))} className="mt-2 text-xs text-luxe-muted hover:text-luxe-black transition-colors flex items-center gap-1">
                            <Bookmark size={12} /> Save for Later
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Saved for later */}
              {savedItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium tracking-wider uppercase mb-4">Saved for Later ({savedItems.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {savedItems.map(item => {
                      const product = item.product || {};
                      return (
                        <div key={item._id} className="border border-luxe-border p-3">
                          <div className="aspect-[3/4] bg-luxe-cream mb-3 overflow-hidden">
                            {(item.image || product.images?.[0]?.url) && (
                              <img src={item.image || product.images?.[0]?.url} alt={item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <p className="text-xs font-medium line-clamp-1">{item.name || product.name}</p>
                          <p className="text-xs text-luxe-muted mt-0.5">₹{(item.price || product.price || 0).toLocaleString()}</p>
                          <button onClick={() => dispatch(saveForLater(item._id))} className="text-2xs text-luxe-gold hover:text-luxe-black mt-2 transition-colors">Move to Bag</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="border border-luxe-border p-6">
                <h3 className="text-sm font-medium tracking-wider uppercase mb-4">Order Summary</h3>

                {/* Coupon */}
                <div className="mb-4">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-green-50 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <Tag size={14} />
                        <span>"{coupon.code}" — save ₹{discount.toLocaleString()}</span>
                      </div>
                      <button onClick={() => dispatch(removeCoupon())} className="text-green-600 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        className="input-field py-2 text-xs flex-1"
                      />
                      <button onClick={handleApplyCoupon} disabled={couponLoading} className="btn-primary text-xs px-4 py-2">
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm border-t border-luxe-border pt-4">
                  <div className="flex justify-between text-luxe-muted"><span>Subtotal ({items.reduce((s,i) => s + i.quantity, 0)} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-luxe-muted"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span></div>
                  <div className="flex justify-between text-luxe-muted"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between font-semibold text-base border-t border-luxe-border pt-3"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
                </div>

                {subtotal < 999 && (
                  <p className="text-xs text-luxe-muted mt-3 text-center">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}

                <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center gap-2 mt-5">
                  Proceed to Checkout <ArrowRight size={14} />
                </button>

                <Link to="/shop" className="block text-center text-xs text-luxe-muted hover:text-luxe-black mt-3 transition-colors">
                  Continue Shopping
                </Link>
              </div>

              {/* Available coupons */}
              <div className="border border-luxe-border p-4">
                <p className="text-xs font-medium mb-3">Available Coupons</p>
                {[{ code: 'WELCOME10', desc: '10% off on first order' }, { code: 'LUXE20', desc: '20% off on ₹3999+' }, { code: 'FLAT500', desc: '₹500 off on ₹2499+' }].map(c => (
                  <div key={c.code} className="flex items-center justify-between py-2 border-b border-luxe-border last:border-0">
                    <div>
                      <p className="text-xs font-mono font-semibold text-luxe-gold">{c.code}</p>
                      <p className="text-2xs text-luxe-muted">{c.desc}</p>
                    </div>
                    <button onClick={() => { setCouponInput(c.code); }} className="text-2xs text-luxe-black underline">Use</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
