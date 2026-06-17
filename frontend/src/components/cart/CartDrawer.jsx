import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { setCartOpen } from '../../store/slices/uiSlice';
import { updateCartItem, removeFromCart, selectCartItems, selectCartSubtotal } from '../../store/slices/cartSlice';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartOpen = useSelector(s => s.ui.cartOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { coupon } = useSelector(s => s.cart);

  const close = () => dispatch(setCartOpen(false));

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-luxe-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-sm font-medium tracking-wider uppercase">Your Bag ({items.length})</h2>
              </div>
              <button onClick={close} className="p-1 hover:bg-luxe-cream rounded-sm transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-luxe-border mb-4" />
                  <h3 className="font-display text-xl mb-2">Your bag is empty</h3>
                  <p className="text-sm text-luxe-muted mb-6">Add items to get started</p>
                  <button onClick={() => { close(); navigate('/shop'); }} className="btn-primary text-xs">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const product = item.product || {};
                    const image = item.image || product.images?.[0]?.url;
                    const name = item.name || product.name;
                    const price = item.price || product.price || 0;
                    return (
                      <div key={item._id} className="flex gap-4">
                        {/* Image */}
                        <Link
                          to={`/product/${product.slug || ''}`}
                          onClick={close}
                          className="flex-shrink-0 w-20 h-24 bg-luxe-cream overflow-hidden"
                        >
                          {image && (
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${product.slug || ''}`}
                            onClick={close}
                            className="text-sm font-medium text-luxe-black hover:text-luxe-gold transition-colors line-clamp-2"
                          >
                            {name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-luxe-muted">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>· {item.color}</span>}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {/* Qty */}
                            <div className="flex items-center border border-luxe-border">
                              <button
                                onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                                className="w-7 h-7 flex items-center justify-center hover:bg-luxe-cream transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                                className="w-7 h-7 flex items-center justify-center hover:bg-luxe-cream transition-colors"
                                disabled={item.quantity >= 10}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold">₹{(price * item.quantity).toLocaleString()}</span>
                              <button
                                onClick={() => dispatch(removeFromCart(item._id))}
                                className="text-luxe-muted hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer summary */}
            {items.length > 0 && (
              <div className="border-t border-luxe-border px-6 py-6 space-y-3">
                {coupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({coupon.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-luxe-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-luxe-border pt-3">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                {subtotal < 999 && (
                  <p className="text-xs text-luxe-muted text-center">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <button onClick={handleCheckout} className="btn-primary w-full justify-center gap-2 mt-2">
                  Checkout <ArrowRight size={14} />
                </button>
                <Link
                  to="/cart"
                  onClick={close}
                  className="block text-center text-xs tracking-wider uppercase text-luxe-muted hover:text-luxe-black transition-colors py-1"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
