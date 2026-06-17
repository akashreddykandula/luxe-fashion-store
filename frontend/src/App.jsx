import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { fetchWishlist } from './store/slices/wishlistSlice';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingScreen from './components/common/LoadingScreen';

// Customer pages (lazy loaded)
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const ShopPage = lazy(() => import('./pages/customer/ShopPage'));
const ProductPage = lazy(() => import('./pages/customer/ProductPage'));
const CategoryPage = lazy(() => import('./pages/customer/CategoryPage'));
const SearchPage = lazy(() => import('./pages/customer/SearchPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/customer/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/customer/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const OrderHistoryPage = lazy(() => import('./pages/customer/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const ContactPage = lazy(() => import('./pages/customer/ContactPage'));
const AboutPage = lazy(() => import('./pages/customer/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/customer/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/customer/TermsPage'));
const ReturnsPage = lazy(() => import('./pages/customer/ReturnsPage'));
const NotFoundPage = lazy(() => import('./pages/customer/NotFoundPage'));

// Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));

// Route guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(s => s.auth);
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector(s => s.auth);
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [token, dispatch]);

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Customer routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/returns-refunds" element={<ReturnsPage />} />
          </Route>

          {/* Auth routes */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
