import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, UserCheck, UserX, Plus, Edit2, Trash2, X, Tag, FolderOpen, Image } from 'lucide-react';
import { userAPI, couponAPI, categoryAPI, bannerAPI } from '../../services/api';
import { Badge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

// ─── AdminCustomers ───────────────────────────────────────────────────────────
export function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page, limit: 20, search: search || undefined });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);

  const toggleStatus = async (userId, current) => {
    try {
      await userAPI.updateStatus(userId, { isActive: !current });
      toast.success(`User ${current ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) { toast.error(err.message || 'Failed to update user'); }
  };

  return (
    <>
      <Helmet><title>Customers — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">{total} registered customers</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pl-9 py-2 text-sm" />
        </div>

        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
              )) : users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-luxe-gold flex items-center justify-center text-white text-xs font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleStatus(user._id, user.isActive)} className={`p-1.5 transition-colors ${user.isActive ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`} title={user.isActive ? 'Deactivate' : 'Activate'}>
                      {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── AdminCoupons ─────────────────────────────────────────────────────────────
const EMPTY_COUPON = { code: '', description: '', discountType: 'percentage', discountValue: '', maxDiscount: '', minOrderAmount: '', usageLimit: '', validUntil: '', isActive: true };

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await couponAPI.getAll();
      setCoupons(res.data.coupons || []);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_COUPON); setShowForm(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ ...c, discountValue: c.discountValue?.toString(), maxDiscount: c.maxDiscount?.toString() || '', minOrderAmount: c.minOrderAmount?.toString() || '', usageLimit: c.usageLimit?.toString() || '', validUntil: c.validUntil?.slice(0, 10) });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await couponAPI.delete(id); toast.success('Coupon deleted'); load(); }
    catch (err) { toast.error(err.message || 'Failed to delete'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined, minOrderAmount: Number(form.minOrderAmount) || 0, usageLimit: form.usageLimit ? Number(form.usageLimit) : null };
      if (editing) { await couponAPI.update(editing._id, payload); toast.success('Coupon updated'); }
      else { await couponAPI.create(payload); toast.success('Coupon created'); }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message || 'Failed to save coupon'); }
    finally { setSaving(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <>
      <Helmet><title>Coupons — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Coupon</button>
        </div>

        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Min Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Valid Until</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
              )) : coupons.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-mono font-semibold text-luxe-gold">{c.code}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}{c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}</td>
                  <td className="px-4 py-3 text-gray-600">₹{c.minOrderAmount || 0}</td>
                  <td className="px-4 py-3 text-gray-600">{c.usedCount}/{c.usageLimit || '∞'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(c.validUntil).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-luxe-gold transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 overflow-y-auto max-h-screen">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="input-label">Code *</label><input {...f('code')} className="input-field uppercase" required /></div>
              <div><label className="input-label">Description</label><input {...f('description')} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Type *</label>
                  <select {...f('discountType')} className="input-field">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div><label className="input-label">Value *</label><input {...f('discountValue')} type="number" min="0" className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Max Discount (₹)</label><input {...f('maxDiscount')} type="number" min="0" className="input-field" /></div>
                <div><label className="input-label">Min Order (₹)</label><input {...f('minOrderAmount')} type="number" min="0" className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Usage Limit</label><input {...f('usageLimit')} type="number" min="1" className="input-field" placeholder="Leave blank for unlimited" /></div>
                <div><label className="input-label">Valid Until *</label><input {...f('validUntil')} type="date" className="input-field" required /></div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="accent-luxe-black" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AdminCategories ──────────────────────────────────────────────────────────
const EMPTY_CAT = { name: '', description: '', gender: 'all', isFeatured: false, isActive: true, order: 0 };

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await categoryAPI.getAll(); setCategories(res.data.categories || []); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await categoryAPI.update(editing._id, form); toast.success('Category updated'); }
      else { await categoryAPI.create(form); toast.success('Category created'); }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryAPI.delete(id); toast.success('Category deleted'); load(); }
    catch (err) { toast.error(err.message || 'Failed to delete'); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <>
      <Helmet><title>Categories — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <button onClick={() => { setEditing(null); setForm(EMPTY_CAT); setShowForm(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Category</button>
        </div>

        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
              )) : categories.map(cat => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{cat.gender}</td>
                  <td className="px-4 py-3"><Badge variant={cat.isFeatured ? 'gold' : 'default'}>{cat.isFeatured ? 'Yes' : 'No'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={cat.isActive ? 'success' : 'danger'}>{cat.isActive ? 'Active' : 'Hidden'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', gender: cat.gender, isFeatured: cat.isFeatured, isActive: cat.isActive, order: cat.order || 0 }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-luxe-gold transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="input-label">Name *</label><input {...f('name')} className="input-field" required /></div>
              <div><label className="input-label">Description</label><input {...f('description')} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Gender</label>
                  <select {...f('gender')} className="input-field">
                    <option value="all">All</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div><label className="input-label">Display Order</label><input {...f('order')} type="number" className="input-field" /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="accent-luxe-black" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="accent-luxe-black" /> Active
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AdminBanners ─────────────────────────────────────────────────────────────
export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bannerAPI.getAll()
      .then(res => setBanners(res.data.banners || []))
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Banners — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm">Manage homepage and promotional banners</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="aspect-video skeleton rounded" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map(banner => (
              <div key={banner._id} className="bg-white border border-gray-100 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img src={banner.image?.url} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-medium">{banner.title}</p>
                  {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs capitalize text-gray-400 border border-gray-200 px-2 py-0.5">{banner.position}</span>
                    <Badge variant={banner.isActive ? 'success' : 'danger'}>{banner.isActive ? 'Active' : 'Hidden'}</Badge>
                  </div>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Image size={40} className="mx-auto mb-3 opacity-30" />
                <p>No banners yet. Upload banners via the API or seeder.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminCustomers;
