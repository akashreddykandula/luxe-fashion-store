import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, Edit2, Trash2, Eye, X, Upload } from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = {
  name: '', description: '', shortDescription: '', price: '', comparePrice: '', category: '',
  gender: 'men', brand: 'LUXE', material: '', stock: '', isFeatured: false,
  isNewArrival: false, isBestSeller: false, isTrending: false, isOnSale: false,
  tags: '', sizes: '', colors: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [productsRes, catsRes] = await Promise.all([
        productAPI.getAll({ page, limit: 15, search: search || undefined }),
        categoryAPI.getAll(),
      ]);
      setProducts(productsRes.data.products || []);
      setTotal(productsRes.data.total || 0);
      setCategories(catsRes.data.categories || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setImageFiles([]);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      ...EMPTY_PRODUCT,
      ...product,
      price: product.price?.toString() || '',
      comparePrice: product.comparePrice?.toString() || '',
      stock: product.stock?.toString() || '',
      tags: product.tags?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      category: product.category?._id || product.category || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      };

      let savedProduct;
      if (editing) {
        const res = await productAPI.update(editing._id, payload);
        savedProduct = res.data.product;
        toast.success('Product updated');
      } else {
        const res = await productAPI.create(payload);
        savedProduct = res.data.product;
        toast.success('Product created');
      }

      // Upload images if selected
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images', f));
        await productAPI.addImages(savedProduct._id, fd);
      }

      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });
  const cb = (key) => ({ checked: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.checked })) });

  return (
    <>
      <Helmet><title>Products — LUXE Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm">{total} products total</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.map(product => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-100 flex-shrink-0 overflow-hidden">
                        {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">₹{product.price?.toLocaleString()}</p>
                    {product.comparePrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">₹{product.comparePrice?.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? `Low (${product.stock})` : product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-luxe-gold">★</span>
                      <span className="text-xs">{product.ratings?.average?.toFixed(1) || '—'}</span>
                      <span className="text-xs text-gray-400">({product.ratings?.count || 0})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.isFeatured && <span className="badge bg-purple-100 text-purple-700">Featured</span>}
                      {product.isNewArrival && <span className="badge bg-blue-100 text-blue-700">New</span>}
                      {product.isOnSale && <span className="badge bg-red-100 text-red-700">Sale</span>}
                      {!product.isActive && <span className="badge bg-gray-100 text-gray-500">Hidden</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye size={15} />
                      </a>
                      <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-luxe-gold transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end overflow-y-auto">
            <div className="bg-white w-full max-w-2xl min-h-screen p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="input-label">Product Name *</label>
                    <input {...f('name')} className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Category *</label>
                    <select {...f('category')} className="input-field" required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Gender *</label>
                    <select {...f('gender')} className="input-field">
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Price (₹) *</label>
                    <input {...f('price')} type="number" min="0" className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Compare Price (₹)</label>
                    <input {...f('comparePrice')} type="number" min="0" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Stock *</label>
                    <input {...f('stock')} type="number" min="0" className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Brand</label>
                    <input {...f('brand')} className="input-field" />
                  </div>
                  <div className="col-span-2">
                    <label className="input-label">Short Description</label>
                    <input {...f('shortDescription')} className="input-field" />
                  </div>
                  <div className="col-span-2">
                    <label className="input-label">Full Description *</label>
                    <textarea {...f('description')} className="input-field min-h-[100px] resize-none" required />
                  </div>
                  <div>
                    <label className="input-label">Sizes (comma-separated)</label>
                    <input {...f('sizes')} className="input-field" placeholder="XS, S, M, L, XL" />
                  </div>
                  <div>
                    <label className="input-label">Colors (comma-separated)</label>
                    <input {...f('colors')} className="input-field" placeholder="White, Black, Navy" />
                  </div>
                  <div>
                    <label className="input-label">Material</label>
                    <input {...f('material')} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Tags (comma-separated)</label>
                    <input {...f('tags')} className="input-field" placeholder="shirt, formal, cotton" />
                  </div>

                  {/* Flags */}
                  <div className="col-span-2">
                    <label className="input-label">Product Flags</label>
                    <div className="flex flex-wrap gap-4">
                      {[['isFeatured','Featured'],['isNewArrival','New Arrival'],['isBestSeller','Best Seller'],['isTrending','Trending'],['isOnSale','On Sale'],['isLimitedEdition','Limited Edition']].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" {...cb(key)} className="accent-luxe-black" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="col-span-2">
                    <label className="input-label">Product Images</label>
                    <div className="border-2 border-dashed border-luxe-border p-4 text-center">
                      <input type="file" multiple accept="image/*" id="img-upload" className="hidden"
                        onChange={e => setImageFiles(Array.from(e.target.files))} />
                      <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload size={24} className="text-luxe-muted" />
                        <span className="text-sm text-luxe-muted">Click to upload images (max 8)</span>
                      </label>
                      {imageFiles.length > 0 && (
                        <p className="text-xs text-green-600 mt-2">{imageFiles.length} file{imageFiles.length > 1 ? 's' : ''} selected</p>
                      )}
                    </div>
                    {editing?.images?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {editing.images.map(img => (
                          <div key={img._id} className="w-12 h-14 overflow-hidden">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-6">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
