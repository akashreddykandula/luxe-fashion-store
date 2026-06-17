import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Lock, ChevronDown, Tag, X } from 'lucide-react';
import { selectCartItems, selectCartSubtotal, clearCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { orderAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const INDIA_STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Pay Online', sub: 'UPI, Cards, Net Banking, Wallets', icon: '💳' },
  { id: 'cod', label: 'Cash on Delivery', sub: '₹50 COD charge may apply', icon: '💵' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { coupon } = useSelector(s => s.cart);

  const [step, setStep] = useState(1); // 1: address, 2: payment
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [guestEmail, setGuestEmail] = useState('');

  // Pre-fill from saved addresses
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setAddress({ name: def.name, phone: def.phone, line1: def.line1, line2: def.line2 || '', city: def.city, state: def.state, pincode: def.pincode, country: def.country });
    }
  }, [user]);

 useEffect (
  () => {
    if (cartItems.length === 0 && !processing) {
      navigate ('/cart');
    }
  },
  [cartItems.length, processing]
);


  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = coupon?.discount || 0;
  const tax = Math.round(subtotal * 0.18);
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      await dispatch(applyCoupon(couponInput.trim()));
    } finally {
      setCouponLoading(false);
      setCouponInput('');
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const required = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!address[f]) { toast.error(`Please fill in ${f}`); return; }
    }
    if (!isAuthenticated && !guestEmail) { toast.error('Please enter your email'); return; }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const placeOrder = async () => {
    setProcessing(true);
    try {
      // Create order
      const orderRes = await orderAPI.create({
        items: cartItems.map(i => ({
          product: i.product?._id || i.product,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          sku: i.sku,
        })),
        shippingAddress: address,
        payment: { method: paymentMethod },
        couponCode: coupon?.code || '',
        guestEmail: !isAuthenticated ? guestEmail : undefined,
        guestName: !isAuthenticated ? address.name : undefined,
      });

      const order = orderRes.data.order;

      // if (paymentMethod === 'cod') {
      //   dispatch(clearCart());
      //   navigate(`/order-success/${order._id}`);
      //   return;
      // }

//       if (paymentMethod === 'cod') {
//   console.log('ORDER CREATED', order);
//   alert('Order Created Successfully');

//   dispatch(clearCart());

//   navigate('/orders');

//   return;
// }

if (paymentMethod === 'cod') {

  console.log('COD BLOCK HIT');

  console.log('ORDER ID:', order._id);

  dispatch(clearCart());

  navigate(`/order-success/${order._id}`);

  return;

}
      // Razorpay flow
      const razorRes = await paymentAPI.createRazorpayOrder(order._id);
      const { razorpayOrderId, amount, keyId } = razorRes.data;

      const options = {
        key: keyId,
        amount,
        currency: 'INR',
        name: 'LUXE Fashion',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            dispatch(clearCart());
            navigate(`/order-success/${order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support with your order number.');
            navigate(`/orders`);
          }
        },
        prefill: {
          name: user?.name || address.name,
          email: user?.email || guestEmail,
          contact: address.phone,
        },
        theme: { color: '#C9A96E' },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setProcessing(false);
    }
  };

  return (
    <>
      <Helmet><title>Checkout — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 min-h-screen bg-luxe-bg-soft">
        <div className="page-container">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="font-display text-2xl font-semibold tracking-widest">LUXE</Link>
            <div className="flex items-center gap-4 text-xs tracking-wider uppercase">
              <span className={step >= 1 ? 'text-luxe-black font-medium' : 'text-luxe-muted'}>1. Address</span>
              <span className="text-luxe-border">—</span>
              <span className={step >= 2 ? 'text-luxe-black font-medium' : 'text-luxe-muted'}>2. Payment</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            {/* Left panel */}
            <div>
              {step === 1 && (
                <div className="bg-white p-8">
                  <h2 className="font-display text-2xl font-medium mb-6">Delivery Address</h2>

                  {/* Guest email */}
                  {!isAuthenticated && (
                    <div className="mb-6">
                      <label className="input-label">Email Address *</label>
                      <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="input-field" placeholder="For order confirmation" required />
                      <p className="text-xs text-luxe-muted mt-1">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
                    </div>
                  )}

                  {/* Saved addresses */}
                  {isAuthenticated && user?.addresses?.length > 0 && (
                    <div className="mb-6">
                      <label className="input-label">Saved Addresses</label>
                      <div className="space-y-2">
                        {user.addresses.map(addr => (
                          <label key={addr._id} className="flex items-start gap-3 p-3 border border-luxe-border cursor-pointer hover:border-luxe-black transition-colors">
                            <input type="radio" name="savedAddress" onChange={() => setAddress({ name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country })} className="mt-1 accent-luxe-black" />
                            <div className="text-sm">
                              <p className="font-medium">{addr.name}</p>
                              <p className="text-luxe-muted">{addr.line1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                              <p className="text-luxe-muted">{addr.phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-luxe-muted mt-3">Or enter a new address below:</p>
                    </div>
                  )}

                  <form onSubmit={handleAddressSubmit} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Full Name *</label>
                      <input value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} className="input-field" required />
                    </div>
                    <div>
                      <label className="input-label">Phone Number *</label>
                      <input value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} className="input-field" pattern="[6-9][0-9]{9}" required />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Address Line 1 *</label>
                      <input value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} className="input-field" placeholder="Flat, House No., Street" required />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Address Line 2</label>
                      <input value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} className="input-field" placeholder="Area, Colony, Landmark (optional)" />
                    </div>
                    <div>
                      <label className="input-label">City *</label>
                      <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className="input-field" required />
                    </div>
                    <div>
                      <label className="input-label">Pincode *</label>
                      <input value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} className="input-field" pattern="[1-9][0-9]{5}" required />
                    </div>
                    <div>
                      <label className="input-label">State *</label>
                      <select value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} className="input-field" required>
                        <option value="">Select state</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Country</label>
                      <input value="India" className="input-field bg-gray-50" readOnly />
                    </div>
                    <div className="col-span-2 pt-2">
                      <button type="submit" className="btn-primary w-full justify-center py-4 text-sm">
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-medium">Payment Method</h2>
                    <button onClick={() => setStep(1)} className="text-xs text-luxe-muted underline">Edit Address</button>
                  </div>

                  {/* Delivery address summary */}
                  <div className="bg-luxe-bg-soft p-4 mb-6 text-sm">
                    <p className="font-medium">{address.name} · {address.phone}</p>
                    <p className="text-luxe-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} — {address.pincode}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {PAYMENT_METHODS.map(method => (
                      <label key={method.id} className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-luxe-black' : 'border-luxe-border hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-luxe-black" />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-luxe-muted">{method.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button onClick={placeOrder} disabled={processing} className="btn-primary w-full justify-center gap-2 py-4 text-sm">
                    <Lock size={14} />
                    {processing ? 'Processing...' : `Place Order · ₹${total.toLocaleString()}`}
                  </button>
                  <p className="text-2xs text-luxe-muted text-center mt-3">
                    By placing your order you agree to our <Link to="/terms-and-conditions" className="underline">Terms & Conditions</Link>
                  </p>
                </div>
              )}
            </div>

            {/* Right panel — order summary */}
            <div className="space-y-4">
              <div className="bg-white p-6">
                <h3 className="text-sm font-medium tracking-wider uppercase mb-4">Order Summary</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cartItems.map(item => {
                    const product = item.product || {};
                    return (
                      <div key={item._id} className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-20 bg-luxe-cream overflow-hidden">
                            <img src={item.image || product.images?.[0]?.url} alt={item.name || product.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-luxe-muted text-white text-2xs rounded-full flex items-center justify-center">{item.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug line-clamp-2">{item.name || product.name}</p>
                          <p className="text-xs text-luxe-muted">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}</p>
                          <p className="text-sm font-semibold mt-1">₹{((item.price || product.price || 0) * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon */}
                <div className="border-t border-luxe-border pt-4 mb-4">
                  {coupon ? (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <Tag size={14} />
                        <span>"{coupon.code}" applied</span>
                      </div>
                      <button onClick={() => dispatch(removeCoupon())} className="text-luxe-muted hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="input-field py-2 text-xs flex-1"
                      />
                      <button onClick={handleApplyCoupon} disabled={couponLoading} className="btn-primary text-xs px-4 py-2">
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-luxe-border pt-4">
                  <div className="flex justify-between text-luxe-muted">
                    <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-luxe-muted">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-luxe-muted">
                    <span>GST (18%)</span><span>₹{tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base border-t border-luxe-border pt-3">
                    <span>Total</span><span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-luxe-muted">
                <Lock size={12} className="text-luxe-gold" />
                <span>Secure checkout powered by Razorpay. Your payment info is encrypted.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
