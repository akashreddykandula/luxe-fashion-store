import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';

export const fetchProducts = createAsyncThunk('product/fetchAll', async (params, { rejectWithValue }) => {
  try { return (await productAPI.getAll(params)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchProduct = createAsyncThunk('product/fetchOne', async (slug, { rejectWithValue }) => {
  try { return (await productAPI.getOne(slug)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

const productSlice = createSlice({
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
export default productSlice.reducer;
