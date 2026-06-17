import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderAPI } from '../../services/api';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOne(orderId)
      .then(res => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-6 w-48 bg-gray-200 mx-auto rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Order Confirmed — LUXE Fashion</title></Helmet>
      <div className="min-h-screen bg-luxe-bg-soft flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white max-w-lg w-full p-10 text-center"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-500" />
          </motion.div>

          <span className="section-tag">Thank you!</span>
          <h1 className="font-display text-3xl font-medium mb-3">Order Confirmed</h1>
          <p className="text-luxe-muted text-sm mb-8">
            Your order has been placed successfully. We'll send you an email confirmation shortly.
          </p>

          {order && (
            <>
              {/* Order number */}
              <div className="bg-luxe-bg-soft px-6 py-4 mb-6">
                <p className="text-xs text-luxe-muted tracking-widest uppercase mb-1">Order Number</p>
                <p className="font-mono text-lg font-semibold text-luxe-black">{order.orderNumber}</p>
              </div>

              {/* Order items */}
              <div className="text-left mb-6">
                <h3 className="text-xs font-medium tracking-widest uppercase mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-14 h-18 bg-luxe-cream flex-shrink-0 overflow-hidden">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-luxe-muted">
                          {item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div className="border-t border-luxe-border pt-4 mb-6 text-sm space-y-1">
                <div className="flex justify-between text-luxe-muted">
                  <span>Subtotal</span><span>₹{order.pricing?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-luxe-muted">
                  <span>Shipping</span>
                  <span>{order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-luxe-border pt-2 mt-2">
                  <span>Total Paid</span><span>₹{order.pricing?.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-green-50 text-green-700 text-xs px-4 py-2 mb-8 flex items-center justify-center gap-2">
                <CheckCircle size={14} />
                Payment: {order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Paid Online'} · {order.payment?.status === 'paid' ? 'Confirmed' : 'Pending'}
              </div>
            </>
          )}

          {/* Estimated delivery */}
          <div className="flex items-center gap-3 bg-luxe-cream p-4 mb-8 text-left">
            <Package size={20} className="text-luxe-gold flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-xs text-luxe-muted">
                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' '}–{' '}
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={`/orders/${orderId}`} className="btn-primary flex-1 justify-center gap-2">
              <Package size={14} /> Track Order
            </Link>
            <Link to="/shop" className="btn-outline flex-1 justify-center gap-2">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
