import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

export const fetchLeadsChart = createAsyncThunk(
  'dashboard/fetchLeadsChart',
  async (type = 'status', { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getLeadsChart(type);
      return { type, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chart data'
      );
    }
  }
);

export const fetchConversionFunnel = createAsyncThunk(
  'dashboard/fetchConversionFunnel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getConversionFunnel();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch conversion funnel'
      );
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRecentActivities(limit);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recent activities'
      );
    }
  }
);

const initialState = {
  stats: {
    overview: {
      totalCustomers: 0,
      totalLeads: 0,
      activeCustomers: 0,
      recentLeads: 0,
      recentCustomers: 0,
      totalLeadValue: 0,
      convertedLeadsValue: 0,
    },
    leadsByStatus: {},
    leadsByPriority: {},
    monthlyLeadTrend: [],
    topCustomers: [],
  },
  chartData: {
    status: [],
    priority: [],
    monthly: [],
  },
  conversionFunnel: {
    funnel: [],
    totalLeads: 0,
    conversionRate: 0,
  },
  recentActivities: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch leads chart
      .addCase(fetchLeadsChart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadsChart.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData[action.payload.type] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchLeadsChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch conversion funnel
      .addCase(fetchConversionFunnel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversionFunnel.fulfilled, (state, action) => {
        state.loading = false;
        state.conversionFunnel = action.payload;
        state.error = null;
      })
      .addCase(fetchConversionFunnel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch recent activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.recentActivities = action.payload;
        state.error = null;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLastUpdated } = dashboardSlice.actions;
export default dashboardSlice.reducer;
