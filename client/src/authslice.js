import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosclient';

// 🔥 REGISTER USER
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log("📤 Sending Data:", userData);

      const response = await axiosClient.post('/user/register', userData);

      console.log("✅ Register Success:", response.data);

      return response.data.user;
    } catch (error) {
      console.log("❌ FULL ERROR:", error);
      console.log("❌ RESPONSE:", error.response);
      console.log("❌ ERROR MESSAGE:", error.response?.data?.error?.message);
    console.log("❌ FULL DATA:", error.response?.data);// 🔥 MOST IMPORTANT

      return rejectWithValue({
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Registration failed',
        status: error.response?.status,
      });
    }
  }
);

// 🔥 LOGIN USER
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("📤 Login Data:", credentials);

      const response = await axiosClient.post('/user/login', credentials);

      console.log("✅ Login Success:", response.data);

      return response.data.user;
    } catch (error) {
      console.log("❌ LOGIN ERROR:", error.response?.data);

      return rejectWithValue({
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Login failed',
        status: error.response?.status,
      });
    }
  }
);

// 🔥 CHECK AUTH
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      // 401 is expected when not logged in
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          'Not authenticated',
        status: error.response?.status,
      });
    }
  }
);

// 🔥 LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout'); // ⚠️ FIXED PATH
      return null;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          'Logout failed',
        status: error.response?.status,
      });
    }
  }
);

// 🔥 SLICE
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
        state.isAuthenticated = false;
        state.user = null;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
        state.isAuthenticated = false;
        state.user = null;
      })

      // CHECK AUTH
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;

        if (action.payload?.status !== 401) {
          state.error =
            action.payload?.message || "Authentication check failed";
        }

        state.user = null;
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Logout failed";
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;