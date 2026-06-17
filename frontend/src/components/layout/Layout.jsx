import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import SearchModal from '../common/SearchModal';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-luxe-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </div>
  );
}
