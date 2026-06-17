// ─── useDebounce.js ───────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── useLocalStorage.js ───────────────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) { console.error(err); }
  };

  return [storedValue, setValue];
}

// ─── useWindowSize.js ─────────────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return size;
}

// ─── useIntersectionObserver.js ───────────────────────────────────────────────
import { useRef, useState } from 'react';

export function useIntersectionObserver(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// ─── useCart.js ───────────────────────────────────────────────────────────────
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { selectIsWishlisted } from '../store/slices/wishlistSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useCartActions(product) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const isWishlisted = useSelector(selectIsWishlisted(product?._id));
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async ({ size, color, quantity = 1 } = {}) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add to cart');
      navigate('/login');
      return false;
    }
    if (!product) return false;
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity, size, color }));
    setAdding(false);
    return true;
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to use wishlist');
      navigate('/login');
      return;
    }
    if (!product) return;
    dispatch(toggleWishlist(product._id));
  };

  return { handleAddToCart, handleToggleWishlist, isWishlisted, adding };
}

// ─── useOrderTracking.js ──────────────────────────────────────────────────────
export function useOrderTracking(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    import('../services/api').then(({ orderAPI }) => {
      orderAPI.getOne(orderId)
        .then(res => setOrder(res.data.order))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    });
  }, [orderId]);

  return { order, loading, error };
}

export default useDebounce;
