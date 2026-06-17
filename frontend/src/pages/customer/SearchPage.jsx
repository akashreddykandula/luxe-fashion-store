// SearchPage.jsx
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ShopPage from './ShopPage';

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  return (
    <>
      <Helmet><title>Search: {query} — LUXE Fashion</title></Helmet>
      <ShopPage />
    </>
  );
}
export default SearchPage;
