import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../../services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store token securely
      await SecureStore.setItemAsync('token', response.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Login failed',
        requiresEmailVerification: error.response?.data?.requiresEmailVerification || false,
        email: error.response?.data?.email || null
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(name, email, password, role);
      
      // Don't store token for unverified users
      // User needs to verify email first
      return {
        ...response.data,
        userEmail: email // Store email for verification screen
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data?.error || null
      });
    }
  }
);


export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userString = await SecureStore.getItemAsync('user');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        return { token, user };
      }
      
      return rejectWithValue('No stored authentication found');
    } catch (error) {
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get current user'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email }, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(name, email);
      
      // Update stored user data
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Profile update failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Remove stored authentication
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
  pendingVerificationEmail: null,
  requiresEmailVerification: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload.message;
        state.requiresEmailVerification = action.payload.requiresEmailVerification;
        state.pendingVerificationEmail = action.payload.email;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false; // Don't authenticate until email is verified
        state.user = null;
        state.token = null;
        state.error = null;
        state.pendingVerificationEmail = action.payload.userEmail;
        state.requiresEmailVerification = action.payload.requiresEmailVerification || false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload.message;
        state.pendingVerificationEmail = null;
        state.requiresEmailVerification = false;
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
      })
      
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
