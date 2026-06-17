import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
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

export const { toggleCart, setCartOpen, toggleMenu, setMenuOpen, toggleSearch, toggleFilter, setFilterOpen } = uiSlice.actions;
export default uiSlice.reducer;
