import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight, Search } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { OrderStatusBadge, Pagination } from '../../components/common/LoadingScreen';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    orderAPI.getMyOrders({ page, limit: 10, status: statusFilter || undefined })
      .then(res => {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setPages(Math.ceil((res.data.total || 0) / 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const STATUS_FILTERS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <>
      <Helmet><title>My Orders — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium mb-1">My Orders</h1>
          <p className="text-luxe-muted text-sm">{total} order{total !== 1 ? 's' : ''} found</p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 text-xs border transition-colors capitalize ${
                statusFilter === s ? 'bg-luxe-black text-white border-luxe-black' : 'border-luxe-border hover:border-luxe-black'
              }`}
            >
              {s || 'All Orders'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 skeleton rounded" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={56} className="text-luxe-border mb-4" />
            <h3 className="font-display text-2xl font-medium mb-2">No orders yet</h3>
            <p className="text-luxe-muted text-sm mb-6">Start shopping to see your orders here</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map(order => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block bg-white border border-luxe-border hover:border-luxe-black transition-colors p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-luxe-muted mb-1">Order #{order.orderNumber}</p>
                      <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight size={16} className="text-luxe-muted" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 mt-4">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-14 h-18 bg-luxe-cream overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="w-14 h-18 bg-luxe-cream flex items-center justify-center text-xs text-luxe-muted flex-shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-luxe-border">
                    <p className="text-xs text-luxe-muted">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    <p className="text-sm font-semibold">₹{order.pricing?.total?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
