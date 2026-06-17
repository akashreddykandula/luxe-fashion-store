import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { return (await cartAPI.get()).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { return (await cartAPI.add(data)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { return (await cartAPI.update(itemId, { quantity })).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { return (await cartAPI.remove(itemId)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const applyCoupon = createAsyncThunk('cart/coupon/apply', async (code, { rejectWithValue }) => {
  try { return (await cartAPI.applyCoupon(code)).data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeCoupon = createAsyncThunk('cart/coupon/remove', async (_, { rejectWithValue }) => {
  try { return (await cartAPI.removeCoupon()).data; }
  catch (err) { return rejectWithValue(err.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    coupon: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
    },
    // Guest cart management (localStorage)
    addGuestItem: (state, action) => {
      const { productId, quantity, size, color, price, name, image, sku } = action.payload;
      const idx = state.items.findIndex(i => i.productId === productId && i.size === size && i.color === color);
      if (idx >= 0) {
        state.items[idx].quantity = Math.min(state.items[idx].quantity + quantity, 10);
      } else {
        state.items.push({ _id: Date.now().toString(), productId, quantity, size, color, price, name, image, sku });
      }
      localStorage.setItem('luxe_guest_cart', JSON.stringify(state.items));
    },
    saveForLater: (state, action) => {
  const item = state.items.find(i => i._id === action.payload);

  if (item) {
    item.savedForLater = !item.savedForLater;
  }

  localStorage.setItem('luxe_guest_cart', JSON.stringify(state.items));
},
    loadGuestCart: (state) => {
      try {
        const saved = localStorage.getItem('luxe_guest_cart');
        if (saved) state.items = JSON.parse(saved);
      } catch {}
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      state.items = action.payload.cart?.items || [];
      state.coupon = action.payload.cart?.coupon || null;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Added to cart');
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Failed to add to cart');
      })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Item removed from cart');
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = { code: action.payload.code, discount: action.payload.discount };
        toast.success(action.payload.message);
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        toast.error(action.payload || 'Invalid coupon');
      })
      .addCase(removeCoupon.fulfilled, (state) => {
        state.coupon = null;
        toast.success('Coupon removed');
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items.filter(i => !i.savedForLater);
export const selectSavedItems = (state) => state.cart.items.filter(i => i.savedForLater);
export const selectCartCount = (state) => selectCartItems(state).reduce((s, i) => s + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  selectCartItems(state).reduce((s, i) => s + (i.price || i.product?.price || 0) * i.quantity, 0);

export const { clearCart, addGuestItem, loadGuestCart, saveForLater } = cartSlice.actions;
export default cartSlice.reducer;
