import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronDown, LogOut, Settings, Package } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/uiSlice';
import { toggleSearch } from '../../store/slices/uiSlice';
import { selectCartCount } from '../../store/slices/cartSlice';

const megaMenu = {
  Women: {
    Clothing: ['Dresses', 'Tops', 'Jeans', 'Trousers', 'Skirts', 'Jackets', 'Coats'],
    Collections: ['New Arrivals', 'Best Sellers', 'Trending Now', 'Limited Edition'],
    Accessories: ['Bags', 'Jewellery', 'Scarves', 'Belts'],
  },
  Men: {
    Clothing: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Suits', 'Knitwear'],
    Collections: ['New Arrivals', 'Best Sellers', 'Trending Now', 'Essentials'],
    Accessories: ['Bags', 'Belts', 'Caps', 'Socks'],
  },
  Kids: {
    Girls: ['Dresses', 'Tops', 'Jeans', 'Skirts'],
    Boys: ['T-Shirts', 'Shorts', 'Jeans', 'Shirts'],
  },
  Sale: {
    Women: ['Dresses', 'Tops', 'Jeans'],
    Men: ['Shirts', 'T-Shirts', 'Jeans'],
    'Up to': ['20% Off', '40% Off', '60% Off'],
  },
};

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(s => s.wishlist.items.length);
  const headerRef = useRef(null);
  const menuTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleMenuEnter = (key) => {
    clearTimeout(menuTimer.current);
    setActiveMenu(key);
  };

  const handleMenuLeave = () => {
    menuTimer.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const getCategoryUrl = (menu, category, item) => {
    const gender = menu.toLowerCase() === 'women' ? 'women' : menu.toLowerCase() === 'men' ? 'men' : '';
    const search = item.toLowerCase().replace(/ /g, '-');
    return `/shop?gender=${gender}&search=${encodeURIComponent(item)}`;
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-0' : 'bg-white py-0'
      }`}
    >
      {/* Promo bar */}
      <div className="bg-luxe-black text-white text-center py-2 text-2xs tracking-widest font-medium">
        FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;|&nbsp; USE CODE: WELCOME10 FOR 10% OFF
      </div>

      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-semibold tracking-widest text-luxe-black">
            LUXE
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {Object.keys(megaMenu).map((key) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleMenuEnter(key)}
                onMouseLeave={handleMenuLeave}
              >
                <button
                  className={`flex items-center gap-1 text-xs font-medium tracking-wider uppercase py-6 transition-colors ${
                    key === 'Sale' ? 'text-red-600' : 'text-luxe-black hover:text-luxe-gold'
                  }`}
                >
                  {key}
                  <ChevronDown size={12} className={`transition-transform ${activeMenu === key ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega dropdown */}
                <AnimatePresence>
                  {activeMenu === key && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-0 w-[600px] bg-white shadow-dropdown border-t-2 border-luxe-gold z-50 p-8"
                      onMouseEnter={() => clearTimeout(menuTimer.current)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="grid grid-cols-3 gap-8">
                        {Object.entries(megaMenu[key]).map(([section, items]) => (
                          <div key={section}>
                            <h3 className="text-2xs font-medium tracking-super-wide uppercase text-luxe-gold mb-4">
                              {section}
                            </h3>
                            <ul className="space-y-2">
                              {items.map((item) => (
                                <li key={item}>
                                  <Link
                                    to={getCategoryUrl(key, section, item)}
                                    className="text-sm text-luxe-charcoal hover:text-luxe-black transition-colors"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-luxe-border">
                        <Link
                          to={`/shop?gender=${key.toLowerCase()}`}
                          className="text-2xs font-medium tracking-widest uppercase text-luxe-black hover:text-luxe-gold transition-colors"
                        >
                          VIEW ALL {key.toUpperCase()} →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link to="/about" className="text-xs font-medium tracking-wider uppercase text-luxe-black hover:text-luxe-gold transition-colors">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Search */}
            <button
              onClick={() => dispatch(toggleSearch())}
              className="p-2 hover:bg-luxe-cream rounded-sm transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:bg-luxe-cream rounded-sm transition-colors hidden sm:flex">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-luxe-gold text-white text-2xs rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User account */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:bg-luxe-cream rounded-sm transition-colors"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </button>
              ) : (
                <Link to="/login" className="p-2 hover:bg-luxe-cream rounded-sm transition-colors flex">
                  <User size={20} />
                </Link>
              )}

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white shadow-dropdown border border-luxe-border z-50"
                  >
                    <div className="px-4 py-3 border-b border-luxe-border">
                      <p className="text-sm font-medium text-luxe-black">{user?.name}</p>
                      <p className="text-xs text-luxe-muted truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-luxe-cream transition-colors">
                        <Settings size={16} /> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-luxe-cream transition-colors">
                        <Package size={16} /> Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-luxe-cream transition-colors">
                        <Heart size={16} /> Wishlist
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-luxe-gold hover:bg-luxe-cream transition-colors">
                          <Settings size={16} /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-luxe-border" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 hover:bg-luxe-cream rounded-sm transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-luxe-black text-white text-2xs rounded-full flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-0 z-40 bg-white overflow-y-auto pt-20 pb-8 px-6"
          >
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5">
              <X size={24} />
            </button>
            <nav className="space-y-0">
              {Object.keys(megaMenu).map((key) => (
                <div key={key} className="border-b border-luxe-border">
                  <Link
                    to={`/shop?gender=${key.toLowerCase()}`}
                    className={`block py-4 text-sm font-medium tracking-wider uppercase ${key === 'Sale' ? 'text-red-600' : 'text-luxe-black'}`}
                  >
                    {key}
                  </Link>
                </div>
              ))}
              <div className="border-b border-luxe-border">
                <Link to="/about" className="block py-4 text-sm font-medium tracking-wider uppercase text-luxe-black">About</Link>
              </div>
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn-outline text-center">My Profile</Link>
                  <Link to="/orders" className="btn-ghost text-center">My Orders</Link>
                  <button onClick={handleLogout} className="text-sm text-red-600 py-2">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary text-center">Login</Link>
                  <Link to="/register" className="btn-outline text-center">Create Account</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
