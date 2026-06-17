// ─── wishlistSlice.js ─────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { return (await wishlistAPI.get()).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { return (await wishlistAPI.toggle(productId)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist || state.items;
        toast.success(action.payload.added ? 'Added to wishlist' : 'Removed from wishlist');
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        toast.error(action.payload || 'Please log in to use wishlist');
      });
  },
});

export const selectWishlistIds = (state) => state.wishlist.items.map(i => i._id || i);
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some(i => (i._id || i) === productId);

export default wishlistSlice.reducer;

// ─── productSlice.js ──────────────────────────────────────────────────────────
import { createSlice as createProductSlice, createAsyncThunk as createProductThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';

export const fetchProducts = createProductThunk('product/fetchAll', async (params, { rejectWithValue }) => {
  try { return (await productAPI.getAll(params)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchProduct = createProductThunk('product/fetchOne', async (slug, { rejectWithValue }) => {
  try { return (await productAPI.getOne(slug)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

const productSlice = createProductSlice({
  name: 'product',
  initialState: {
    products: [],
    product: null,
    related: [],
    total: 0,
    pages: 1,
    page: 1,
    loading: false,
    error: null,
    recentlyViewed: JSON.parse(localStorage.getItem('luxe_recently_viewed') || '[]'),
  },
  reducers: {
    addRecentlyViewed: (state, action) => {
      const existing = state.recentlyViewed.filter(p => p._id !== action.payload._id);
      state.recentlyViewed = [action.payload, ...existing].slice(0, 8);
      localStorage.setItem('luxe_recently_viewed', JSON.stringify(state.recentlyViewed));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.product = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product;
        state.related = action.payload.related || [];
      })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { addRecentlyViewed } = productSlice.actions;
export const productReducer = productSlice.reducer;

// ─── uiSlice.js ───────────────────────────────────────────────────────────────
import { createSlice as createUISlice } from '@reduxjs/toolkit';

const uiSlice = createUISlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    menuOpen: false,
    searchOpen: false,
    filterOpen: false,
  },
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, action) => { state.cartOpen = action.payload; },
    toggleMenu: (state) => { state.menuOpen = !state.menuOpen; },
    setMenuOpen: (state, action) => { state.menuOpen = action.payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleFilter: (state) => { state.filterOpen = !state.filterOpen; },
    setFilterOpen: (state, action) => { state.filterOpen = action.payload; },
  },
});

export const uiReducer = uiSlice.reducer;
export const { toggleCart, setCartOpen, toggleMenu, setMenuOpen, toggleSearch, toggleFilter, setFilterOpen } = uiSlice.actions;
