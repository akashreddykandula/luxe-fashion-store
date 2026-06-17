import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Package, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';


function StatCard({ icon: Icon, label, value, change, color = 'gold' }) {
  const colors = { gold: 'text-luxe-gold bg-luxe-gold/10', green: 'text-green-600 bg-green-50', blue: 'text-blue-600 bg-blue-50', purple: 'text-purple-600 bg-purple-50' };
  const isPositive = change >= 0;
  return (
    <div className="bg-white p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SimpleBarChart({ data }) {
  if (!data?.length) return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>;
  const maxRev = Math.max(...data.map(d => d.revenue));
  return (
    <div className="h-48 flex items-end gap-1">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-luxe-gold rounded-t-sm min-h-[2px] transition-all duration-500"
            style={{ height: `${maxRev > 0 ? (d.revenue / maxRev) * 160 : 2}px` }}
            title={`${d._id}: ₹${d.revenue?.toLocaleString()}`}
          />
          {i % 3 === 0 && <span className="text-2xs text-gray-400 rotate-45 origin-left">{d._id?.slice(5)}</span>}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  const { stats, topProducts, recentOrders, revenueByDay, ordersByStatus } = data || {};
console.log ('Dashboard Data State:', data);

  return (
    <>
      <Helmet><title>Dashboard — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of your store's performance</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} color="gold" />
          <StatCard icon={DollarSign} label="This Month" value={`₹${(stats?.monthRevenue || 0).toLocaleString()}`} change={stats?.revenueGrowth} color="green" />
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders || 0} color="blue" />
          <StatCard icon={Users} label="Total Customers" value={stats?.totalCustomers || 0} color="purple" />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingCart} label="Orders This Month" value={stats?.monthOrders || 0} color="blue" />
          <StatCard icon={Users} label="New Customers" value={stats?.monthCustomers || 0} color="purple" />
          <StatCard icon={AlertCircle} label="Pending Orders" value={stats?.pendingOrders || 0} color="gold" />
          {/* <StatCard icon={Package} label="Products" value="—" color="green" /> */}
          <StatCard
  icon={Package}
  label="Products"
  value={stats?.totalProducts || 0}
  color="green"
/>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-white p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue (Last 14 Days)</h3>
            <SimpleBarChart data={revenueByDay} />
          </div>

          {/* Orders by status */}
          <div className="bg-white p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
            <div className="space-y-3">
              {ordersByStatus && Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <OrderStatusBadge status={status} />
                  <span className="font-semibold text-sm">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-white border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-luxe-gold hover:text-luxe-black transition-colors">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders?.map(order => (
                <div key={order._id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.user?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-xs font-semibold mt-1">₹{order.pricing?.total?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Top Products</h3>
              <Link to="/admin/products" className="text-xs text-luxe-gold hover:text-luxe-black transition-colors">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {topProducts?.map((product, i) => (
                <div key={product._id} className="p-4 flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-200 w-6 flex-shrink-0">{i + 1}</span>
                  <div className="w-10 h-12 bg-gray-100 flex-shrink-0 overflow-hidden">
                    {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.soldCount} sold · ₹{product.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-shrink-0">
                    {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= Math.round(product.ratings?.average || 0) ? 'text-luxe-gold' : 'text-gray-200'}`}>★</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
