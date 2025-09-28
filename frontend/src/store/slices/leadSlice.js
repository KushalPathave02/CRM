import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadAPI } from '../../services/api';

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async ({ page = 1, limit = 10, status = '', customer = '', priority = '' }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getLeads({ page, limit, status, customer, priority });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leads'
      );
    }
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getLeadById(leadId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch lead'
      );
    }
  }
);

export const fetchLeadsByCustomer = createAsyncThunk(
  'leads/fetchLeadsByCustomer',
  async ({ customerId, status = '' }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getLeadsByCustomer(customerId, status);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customer leads'
      );
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await leadAPI.createLead(leadData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create lead'
      );
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ leadId, leadData }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.updateLead(leadId, leadData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update lead'
      );
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (leadId, { rejectWithValue }) => {
    try {
      await leadAPI.deleteLead(leadId);
      return leadId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete lead'
      );
    }
  }
);

export const addLeadNote = createAsyncThunk(
  'leads/addLeadNote',
  async ({ leadId, content }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.addNote(leadId, content);
      return { leadId, note: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add note'
      );
    }
  }
);

const initialState = {
  leads: [],
  customerLeads: [],
  currentLead: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  statusFilter: '',
  priorityFilter: '',
  customerFilter: '',
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setCustomerFilter: (state, action) => {
      state.customerFilter = action.payload;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    },
    clearCustomerLeads: (state) => {
      state.customerLeads = [];
    },
    resetLeads: (state) => {
      state.leads = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch lead by ID
      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
        state.error = null;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch leads by customer
      .addCase(fetchLeadsByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadsByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customerLeads = action.payload;
        state.error = null;
      })
      .addCase(fetchLeadsByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create lead
      .addCase(createLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.unshift(action.payload);
        state.customerLeads.unshift(action.payload);
        state.error = null;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update lead
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in leads array
        const leadsIndex = state.leads.findIndex(
          lead => lead._id === action.payload._id
        );
        if (leadsIndex !== -1) {
          state.leads[leadsIndex] = action.payload;
        }
        
        // Update in customer leads array
        const customerLeadsIndex = state.customerLeads.findIndex(
          lead => lead._id === action.payload._id
        );
        if (customerLeadsIndex !== -1) {
          state.customerLeads[customerLeadsIndex] = action.payload;
        }
        
        // Update current lead
        if (state.currentLead && state.currentLead._id === action.payload._id) {
          state.currentLead = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete lead
      .addCase(deleteLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter(lead => lead._id !== action.payload);
        state.customerLeads = state.customerLeads.filter(lead => lead._id !== action.payload);
        if (state.currentLead && state.currentLead._id === action.payload) {
          state.currentLead = null;
        }
        state.error = null;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add lead note
      .addCase(addLeadNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLeadNote.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentLead && state.currentLead._id === action.payload.leadId) {
          state.currentLead.notes.push(action.payload.note);
        }
        state.error = null;
      })
      .addCase(addLeadNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setStatusFilter,
  setPriorityFilter,
  setCustomerFilter,
  clearCurrentLead,
  clearCustomerLeads,
  resetLeads,
} = leadSlice.actions;

export default leadSlice.reducer;
