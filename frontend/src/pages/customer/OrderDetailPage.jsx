import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MapPin, Package, RotateCcw, X } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(res => setOrder(res.data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await orderAPI.cancel(id, { reason: 'Customer requested cancellation' });
      setOrder(res.data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) { toast.error('Please provide a reason'); return; }
    setReturning(true);
    try {
      const res = await orderAPI.requestReturn(id, { reason: returnReason });
      setOrder(res.data.order);
      setShowReturnForm(false);
      toast.success('Return request submitted');
    } catch (err) {
      toast.error(err.message || 'Cannot request return');
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 page-container pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 skeleton" />
          <div className="h-64 skeleton" />
          <div className="h-48 skeleton" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 page-container pb-20 text-center">
        <h2 className="font-display text-2xl mb-4">Order not found</h2>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);
  const canReturn = order.status === 'delivered' && !order.returnRequest?.requested;

  return (
    <>
      <Helmet><title>Order {order.orderNumber} — LUXE</title></Helmet>
      <div className="pt-24 pb-20 page-container">
        {/* Back & header */}
        <Link to="/orders" className="flex items-center gap-2 text-xs text-luxe-muted hover:text-luxe-black transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-medium mb-1">Order #{order.orderNumber}</h1>
            <p className="text-luxe-muted text-sm">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling} className="text-xs text-red-600 border border-red-200 px-3 py-1.5 hover:bg-red-50 transition-colors">
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            {canReturn && (
              <button onClick={() => setShowReturnForm(true)} className="text-xs border border-luxe-border px-3 py-1.5 hover:border-luxe-black transition-colors flex items-center gap-1">
                <RotateCcw size={12} /> Return
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress tracker */}
            {!['cancelled', 'return_requested', 'returned', 'refunded'].includes(order.status) && (
              <div className="bg-white p-6">
                <h3 className="text-sm font-medium mb-6 tracking-wider uppercase">Order Progress</h3>
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-luxe-gold transition-all duration-500"
                      style={{ width: `${currentStep >= 0 ? (currentStep / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10 ${
                            done ? 'bg-luxe-gold border-luxe-gold text-white' : 'bg-white border-gray-300 text-gray-300'
                          } ${active ? 'ring-4 ring-luxe-gold/20' : ''}`}>
                            {done ? '✓' : <span className="w-2 h-2 rounded-full bg-current" />}
                          </div>
                          <span className={`text-2xs text-center capitalize hidden sm:block ${done ? 'text-luxe-black font-medium' : 'text-luxe-muted'}`}>
                            {step.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking info */}
                {order.tracking?.trackingNumber && (
                  <div className="mt-6 p-4 bg-luxe-bg-soft text-sm">
                    <p className="font-medium">Tracking: {order.tracking.carrier && `${order.tracking.carrier} · `}{order.tracking.trackingNumber}</p>
                    {order.tracking.estimatedDelivery && (
                      <p className="text-luxe-muted text-xs mt-1">
                        Estimated by {new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="bg-white p-6">
              <h3 className="text-sm font-medium mb-4 tracking-wider uppercase">Items ({order.items?.length})</h3>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-luxe-border last:border-0 last:pb-0">
                    <div className="w-20 h-26 bg-luxe-cream flex-shrink-0 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <div className="flex gap-3 text-xs text-luxe-muted mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="text-sm font-semibold mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return request form */}
            {showReturnForm && (
              <div className="bg-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium tracking-wider uppercase">Request Return</h3>
                  <button onClick={() => setShowReturnForm(false)}><X size={18} /></button>
                </div>
                <form onSubmit={handleReturn} className="space-y-4">
                  <div>
                    <label className="input-label">Reason for Return</label>
                    <textarea
                      value={returnReason}
                      onChange={e => setReturnReason(e.target.value)}
                      className="input-field min-h-[100px] resize-none"
                      placeholder="Please describe why you want to return this item..."
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={returning} className="btn-primary">
                      {returning ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                    <button type="button" onClick={() => setShowReturnForm(false)} className="btn-outline">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right — summary */}
          <div className="space-y-4">
            {/* Shipping address */}
            <div className="bg-white p-6">
              <h3 className="text-sm font-medium mb-4 tracking-wider uppercase flex items-center gap-2"><MapPin size={14} /> Delivery Address</h3>
              <div className="text-sm text-luxe-muted space-y-1">
                <p className="text-luxe-black font-medium">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.line1}</p>
                {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white p-6">
              <h3 className="text-sm font-medium mb-4 tracking-wider uppercase">Payment</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-luxe-muted">
                  <span>Method</span>
                  <span className="capitalize">{order.payment?.method === 'cod' ? 'Cash on Delivery' : order.payment?.method}</span>
                </div>
                <div className="flex justify-between text-luxe-muted">
                  <span>Status</span>
                  <span className={order.payment?.status === 'paid' ? 'text-green-600' : 'capitalize text-luxe-muted'}>
                    {order.payment?.status === 'paid' ? '✓ Paid' : order.payment?.status}
                  </span>
                </div>
                {order.payment?.razorpayPaymentId && (
                  <div className="flex justify-between text-luxe-muted text-xs">
                    <span>Payment ID</span>
                    <span className="font-mono">{order.payment.razorpayPaymentId.slice(-8)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order totals */}
            <div className="bg-white p-6">
              <h3 className="text-sm font-medium mb-4 tracking-wider uppercase">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-luxe-muted">
                  <span>Subtotal</span><span>₹{order.pricing?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-luxe-muted">
                  <span>Shipping</span>
                  <span>{order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping}`}</span>
                </div>
                <div className="flex justify-between text-luxe-muted">
                  <span>Tax</span><span>₹{order.pricing?.tax?.toLocaleString()}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-₹{order.pricing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t border-luxe-border pt-3 mt-2">
                  <span>Total</span><span>₹{order.pricing?.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
