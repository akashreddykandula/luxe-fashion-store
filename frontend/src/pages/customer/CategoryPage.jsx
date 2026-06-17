import { useParams } from 'react-router-dom';
import ShopPage from './ShopPage';

export default function CategoryPage() {
  // CategoryPage wraps ShopPage with category param pre-set via URL
  return <ShopPage />;
}
