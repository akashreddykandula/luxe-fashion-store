import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, Grid, List, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/shop/ProductCard';
import { ProductGridSkeleton, Pagination } from '../../components/common/LoadingScreen';
import { productAPI } from '../../services/api';

const SIZES = ['XS','S','M','L','XL','XXL','28','30','32','34','36'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
];

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-luxe-border py-4">
      <button onClick={onToggle} className="flex items-center justify-between w-full text-sm font-medium text-luxe-black">
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ price: true, size: true, color: false, brand: false });
  const [filters, setFilters] = useState({ sizes: [], colors: [], brands: [] });

  const gender = params.get('gender') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '-createdAt';
  const page = parseInt(params.get('page') || '1');
  const selectedSizes = params.get('sizes')?.split(',').filter(Boolean) || [];
  const selectedColors = params.get('colors')?.split(',').filter(Boolean) || [];
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const isNewArrival = params.get('isNewArrival') === 'true';
  const isBestSeller = params.get('isBestSeller') === 'true';
  const isTrending = params.get('isTrending') === 'true';
  const isOnSale = params.get('isOnSale') === 'true';
  const search = params.get('search') || '';

  const buildQuery = () => {
    const q = { sort, page, limit: 12 };
    if (gender) q.gender = gender;
    if (category) q.category = category;
    if (minPrice) q.minPrice = minPrice;
    if (maxPrice) q.maxPrice = maxPrice;
    if (selectedSizes.length) q.sizes = selectedSizes.join(',');
    if (selectedColors.length) q.colors = selectedColors.join(',');
    if (isNewArrival) q.isNewArrival = true;
    if (isBestSeller) q.isBestSeller = true;
    if (isTrending) q.isTrending = true;
    if (isOnSale) q.isOnSale = true;
    if (search) q.search = search;
    return q;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productsRes, filterRes] = await Promise.all([
          productAPI.getAll(buildQuery()),
          productAPI.getFilterOptions({ gender, category }),
        ]);
        setProducts(productsRes.data.products || []);
        setTotal(productsRes.data.total || 0);
        setPages(productsRes.data.pages || 1);
        const f = filterRes.data.filters || {};
        setFilters({
          sizes: f.sizes || SIZES,
          colors: f.colors || [],
          brands: f.brands || [],
          priceRange: f.priceRange || { min: 0, max: 10000 },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.toString()]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const toggleArrayParam = (key, value) => {
    const current = params.get(key)?.split(',').filter(Boolean) || [];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    updateParam(key, next.join(','));
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (gender) next.set('gender', gender);
    setParams(next);
  };

  const activeFiltersCount = [
    selectedSizes.length, selectedColors.length, minPrice ? 1 : 0, maxPrice ? 1 : 0,
    isNewArrival ? 1 : 0, isBestSeller ? 1 : 0, isOnSale ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const pageTitle = gender
    ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Collection`
    : search ? `Search: "${search}"` : 'All Products';

  const Filters = () => (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium tracking-wider uppercase">Filters</h3>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-luxe-muted hover:text-luxe-black flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSizes.map(s => (
            <button key={s} onClick={() => toggleArrayParam('sizes', s)} className="flex items-center gap-1 px-2 py-1 bg-luxe-black text-white text-xs">
              {s} <X size={10} />
            </button>
          ))}
          {selectedColors.map(c => (
            <button key={c} onClick={() => toggleArrayParam('colors', c)} className="flex items-center gap-1 px-2 py-1 bg-luxe-black text-white text-xs">
              {c} <X size={10} />
            </button>
          ))}
        </div>
      )}

      {/* Category filters */}
      <FilterSection title="Availability" open={openSections.avail} onToggle={() => setOpenSections(s => ({ ...s, avail: !s.avail }))}>
        {[
          { label: 'New Arrivals', key: 'isNewArrival', val: isNewArrival },
          { label: 'Best Sellers', key: 'isBestSeller', val: isBestSeller },
          { label: 'Trending', key: 'isTrending', val: isTrending },
          { label: 'On Sale', key: 'isOnSale', val: isOnSale },
        ].map(({ label, key, val }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-luxe-charcoal mb-2 cursor-pointer">
            <input type="checkbox" checked={val} onChange={() => updateParam(key, val ? '' : 'true')} className="accent-luxe-black" />
            {label}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price Range" open={openSections.price} onToggle={() => setOpenSections(s => ({ ...s, price: !s.price }))}>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => updateParam('minPrice', e.target.value)}
            className="input-field py-2 text-xs w-full"
          />
          <span className="text-luxe-muted text-xs">to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => updateParam('maxPrice', e.target.value)}
            className="input-field py-2 text-xs w-full"
          />
        </div>
        {/* Quick price ranges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[['Under ₹1000','','999'],['₹1000–₹3000','1000','3000'],['₹3000+','3000','']].map(([label, min, max]) => (
            <button
              key={label}
              onClick={() => { updateParam('minPrice', min); updateParam('maxPrice', max); }}
              className="px-2 py-1 text-xs border border-luxe-border hover:border-luxe-black transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size" open={openSections.size} onToggle={() => setOpenSections(s => ({ ...s, size: !s.size }))}>
        <div className="flex flex-wrap gap-2">
          {(filters.sizes.length ? filters.sizes : SIZES).map(size => (
            <button
              key={size}
              onClick={() => toggleArrayParam('sizes', size)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                selectedSizes.includes(size) ? 'bg-luxe-black text-white border-luxe-black' : 'border-luxe-border hover:border-luxe-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {filters.colors?.length > 0 && (
        <FilterSection title="Color" open={openSections.color} onToggle={() => setOpenSections(s => ({ ...s, color: !s.color }))}>
          <div className="flex flex-wrap gap-2">
            {filters.colors.map(color => (
              <button
                key={color}
                onClick={() => toggleArrayParam('colors', color)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  selectedColors.includes(color) ? 'bg-luxe-black text-white border-luxe-black' : 'border-luxe-border hover:border-luxe-black'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {filters.brands?.length > 0 && (
        <FilterSection title="Brand" open={openSections.brand} onToggle={() => setOpenSections(s => ({ ...s, brand: !s.brand }))}>
          {filters.brands.map(brand => (
            <label key={brand} className="flex items-center gap-2 text-sm text-luxe-charcoal mb-2 cursor-pointer">
              <input type="checkbox" className="accent-luxe-black" />
              {brand}
            </label>
          ))}
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{pageTitle} — LUXE Fashion</title>
        <meta name="description" content={`Shop ${pageTitle} at LUXE. Premium quality fashion.`} />
      </Helmet>

      <div className="pt-24 pb-20">
        {/* Breadcrumb & header */}
        <div className="page-container mb-8">
          <nav className="text-xs text-luxe-muted mb-4">
            <Link to="/" className="hover:text-luxe-black">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-luxe-black">{pageTitle}</span>
          </nav>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-medium">{pageTitle}</h1>
              {!loading && <p className="text-luxe-muted text-sm mt-1">{total} items</p>}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
                className="input-field py-2 text-xs w-44"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-luxe-border px-3 py-2 text-xs tracking-wider uppercase"
              >
                <SlidersHorizontal size={14} />
                Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>
          </div>
        </div>

        <div className="page-container flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <Filters />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? <ProductGridSkeleton count={12} /> : (
              products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="font-display text-2xl font-medium mb-2">No products found</h3>
                  <p className="text-luxe-muted text-sm mb-6">Try adjusting your filters or browse all products</p>
                  <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                  </div>
                  <Pagination page={page} pages={pages} onPageChange={p => updateParam('page', p.toString())} />
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setFilterOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium tracking-wider uppercase">Filters</h2>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
              <Filters />
              <button onClick={() => setFilterOpen(false)} className="btn-primary w-full mt-6">Apply Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
