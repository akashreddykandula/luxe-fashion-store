import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { toggleSearch } from '../../store/slices/uiSlice';
import { productAPI } from '../../services/api';

const TRENDING = ['White Oxford Shirt', 'Floral Dress', 'Slim Jeans', 'Cashmere Sweater', 'Linen Shirt'];

export default function SearchModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchOpen = useSelector(s => s.ui.searchOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  const recentSearches = JSON.parse(localStorage.getItem('luxe_recent_searches') || '[]');

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ search: query, limit: 5 });
        setResults(res.data.products || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const saveSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    localStorage.setItem('luxe_recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (term = query) => {
    if (!term.trim()) return;
    saveSearch(term.trim());
    dispatch(toggleSearch());
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const close = () => dispatch(toggleSearch());

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={close}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 bg-white z-50 shadow-dropdown"
          >
            {/* Search input */}
            <div className="page-container py-5">
              <div className="relative flex items-center">
                <Search size={20} className="absolute left-4 text-luxe-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for products, brands, styles..."
                  className="w-full bg-luxe-bg-soft border border-luxe-border pl-12 pr-12 py-4 text-sm outline-none focus:border-luxe-black transition-colors"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-12 text-luxe-muted hover:text-luxe-black">
                    <X size={18} />
                  </button>
                )}
                <button onClick={close} className="absolute right-4 text-luxe-muted hover:text-luxe-black">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Results / suggestions */}
            <div className="page-container pb-8">
              {loading && (
                <div className="py-4 text-center text-sm text-luxe-muted">Searching...</div>
              )}

              {!loading && query && results.length > 0 && (
                <div className="mb-4">
                  <p className="text-2xs tracking-widest uppercase text-luxe-muted mb-3">Products</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.map(product => (
                      <button
                        key={product._id}
                        onClick={() => { close(); navigate(`/product/${product.slug}`); }}
                        className="flex items-center gap-3 p-2 hover:bg-luxe-cream rounded-sm transition-colors text-left"
                      >
                        <div className="w-12 h-14 bg-luxe-cream flex-shrink-0 overflow-hidden">
                          <img
                            src={product.images?.[0]?.url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-luxe-black truncate">{product.name}</p>
                          <p className="text-xs text-luxe-muted">₹{product.price?.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    className="mt-3 text-xs tracking-wider uppercase text-luxe-gold hover:text-luxe-black transition-colors"
                  >
                    View all results for "{query}" →
                  </button>
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <p className="text-sm text-luxe-muted py-3">No results for "{query}"</p>
              )}

              {!query && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-2xs tracking-widest uppercase text-luxe-muted mb-3 flex items-center gap-2">
                        <Clock size={12} /> Recent
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map(s => (
                          <button
                            key={s}
                            onClick={() => { setQuery(s); handleSearch(s); }}
                            className="px-3 py-1.5 border border-luxe-border text-sm hover:border-luxe-black transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-2xs tracking-widest uppercase text-luxe-muted mb-3 flex items-center gap-2">
                      <TrendingUp size={12} /> Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map(s => (
                        <button
                          key={s}
                          onClick={() => handleSearch(s)}
                          className="px-3 py-1.5 bg-luxe-cream text-sm hover:bg-luxe-border transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
