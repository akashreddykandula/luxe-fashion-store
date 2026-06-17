import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Eye, ChevronDown, X } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { OrderStatusBadge, Pagination } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','returned','refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', note: '', trackingNumber: '', carrier: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllOrders({ page, limit: 15, status: statusFilter || undefined, search: search || undefined });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      setPages(Math.ceil((res.data.total || 0) / 15));
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter, search]);

  const openOrder = (order) => {
    setSelected(order);
    setUpdateForm({ status: order.status, note: '', trackingNumber: order.tracking?.trackingNumber || '', carrier: order.tracking?.carrier || '' });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await adminAPI.updateOrderStatus(selected._id, updateForm);
      toast.success('Order updated successfully');
      setSelected(res.data.order);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Helmet><title>Orders — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{total} orders total</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9 py-2 text-sm w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-44"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.user?.email || order.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.items?.length} items</td>
                  <td className="px-4 py-3 font-semibold">₹{order.pricing?.total?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${order.payment?.status === 'paid' ? 'text-green-600' : order.payment?.status === 'failed' ? 'text-red-500' : 'text-yellow-600'}`}>
                      {order.payment?.status?.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400 capitalize">{order.payment?.method}</p>
                  </td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openOrder(order)} className="p-1.5 text-gray-400 hover:text-luxe-gold transition-colors">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      {/* Order detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end overflow-y-auto">
          <div className="bg-white w-full max-w-lg min-h-screen p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Order {selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            {/* Customer info */}
            <div className="bg-gray-50 p-4 mb-5 rounded">
              <p className="text-sm font-medium">{selected.user?.name || selected.guestName || 'Guest'}</p>
              <p className="text-xs text-gray-500">{selected.user?.email || selected.guestEmail}</p>
            </div>

            {/* Items */}
            <div className="mb-5">
              <h3 className="text-xs font-medium tracking-wider uppercase mb-3 text-gray-500">Items</h3>
              <div className="space-y-2">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-10 h-12 bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-100 pt-4 mb-5 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{selected.pricing?.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{selected.pricing?.shipping === 0 ? 'FREE' : `₹${selected.pricing?.shipping}`}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{selected.pricing?.tax?.toLocaleString()}</span></div>
              {selected.pricing?.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{selected.pricing.discount.toLocaleString()}</span></div>}
              <div className="flex justify-between font-bold border-t border-gray-100 pt-2"><span>Total</span><span>₹{selected.pricing?.total?.toLocaleString()}</span></div>
            </div>

            {/* Shipping address */}
            <div className="mb-5">
              <h3 className="text-xs font-medium tracking-wider uppercase mb-2 text-gray-500">Shipping Address</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{selected.shippingAddress?.name}</p>
                <p>{selected.shippingAddress?.line1}{selected.shippingAddress?.line2 ? `, ${selected.shippingAddress.line2}` : ''}</p>
                <p>{selected.shippingAddress?.city}, {selected.shippingAddress?.state} — {selected.shippingAddress?.pincode}</p>
                <p>{selected.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Return request */}
            {selected.returnRequest?.requested && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 mb-5 rounded text-sm">
                <p className="font-medium text-yellow-800 mb-1">Return Request</p>
                <p className="text-yellow-700">{selected.returnRequest.reason}</p>
                <p className="text-xs text-yellow-600 mt-1">Requested: {new Date(selected.returnRequest.requestedAt).toLocaleDateString()}</p>
              </div>
            )}

            {/* Update status form */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-medium tracking-wider uppercase mb-4 text-gray-500">Update Order</h3>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={updateForm.status}
                    onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                    className="input-field text-sm"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Internal Note</label>
                  <input
                    type="text"
                    value={updateForm.note}
                    onChange={e => setUpdateForm(f => ({ ...f, note: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Optional note"
                  />
                </div>
                {['shipped', 'out_for_delivery'].includes(updateForm.status) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Carrier</label>
                      <input
                        type="text"
                        value={updateForm.carrier}
                        onChange={e => setUpdateForm(f => ({ ...f, carrier: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="e.g. Delhivery"
                      />
                    </div>
                    <div>
                      <label className="input-label">Tracking No.</label>
                      <input
                        type="text"
                        value={updateForm.trackingNumber}
                        onChange={e => setUpdateForm(f => ({ ...f, trackingNumber: e.target.value }))}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                )}
                <button type="submit" disabled={updating} className="btn-primary w-full justify-center">
                  {updating ? 'Updating...' : 'Update Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
