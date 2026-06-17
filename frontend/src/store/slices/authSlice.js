import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const getInitialUser = () => {
  try {
    return JSON.parse(localStorage.getItem('luxe_user'));
  } catch { return null; }
};

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getMe();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updatePassword = createAsyncThunk('auth/updatePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.updatePassword(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    token: localStorage.getItem('luxe_token'),
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('luxe_token'),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_user');
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('luxe_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('luxe_token', action.payload.token);
      localStorage.setItem('luxe_user', JSON.stringify(action.payload.user));
    };

    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        handleAuthSuccess(state, action);
        toast.success(`Welcome to LUXE, ${action.payload.user.name}!`);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Registration failed');
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        handleAuthSuccess(state, action);
        toast.success(`Welcome back, ${action.payload.user.name}!`);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Login failed');
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('luxe_user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('luxe_token');
        localStorage.removeItem('luxe_user');
      })
      .addCase(updatePassword.pending, (state) => { state.loading = true; })
      .addCase(updatePassword.fulfilled, (state, action) => {
        handleAuthSuccess(state, action);
        toast.success('Password updated successfully');
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Failed to update password');
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
