// ============================================================
// leaveSlice.js - Redux Slice for Leave Management
// ============================================================
// This slice handles:
// 1. Employee applying for leaves and viewing personal leave balance & requests
// 2. Manager / HR viewing pending leave requests and all leaves
// 3. Approving, Rejecting, and Cancelling leave applications
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

const initialState = {
  leaves: [],          // All leaves (used by HR / Manager)
  myLeaves: [],        // Leaves submitted by current logged-in employee
  pendingLeaves: [],   // Pending leaves awaiting manager/HR approval
  leaveBalance: null,  // Remaining leave balance (casual, sick, earned)
  loading: false,      // Loading state for UI buttons and tables
  error: null          // Error message
};

// 1. Apply for Leave
export const applyLeave = createAsyncThunk(
  'leaves/applyLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leaves/apply', leaveData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to submit leave request');
    }
  }
);

// 2. Fetch My Leaves (Current logged in user)
export const fetchMyLeaves = createAsyncThunk(
  'leaves/fetchMyLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/my');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch my leaves');
    }
  }
);

// 3. Fetch All Leaves (For HR / Manager with filters)
export const fetchAllLeaves = createAsyncThunk(
  'leaves/fetchAllLeaves',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch leaves');
    }
  }
);

// 4. Fetch Pending Leaves (Quick list for Manager / HR dashboard)
export const fetchPendingLeaves = createAsyncThunk(
  'leaves/fetchPendingLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/pending');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch pending leaves');
    }
  }
);

// 5. Approve Leave Request
export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async ({ id, comments = '' }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${id}/approve`, { comments });
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to approve leave');
    }
  }
);

// 6. Reject Leave Request
export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async ({ id, comments = '' }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${id}/reject`, { comments });
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to reject leave');
    }
  }
);

// 7. Cancel Leave Request (Employee cancels own pending leave)
export const cancelLeave = createAsyncThunk(
  'leaves/cancelLeave',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/leaves/${id}`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to cancel leave');
    }
  }
);

// 8. Fetch Leave Balance for Current Employee
export const fetchLeaveBalance = createAsyncThunk(
  'leaves/fetchLeaveBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/balance');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch leave balance');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // applyLeave
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        const newLeave = action.payload.data || action.payload.leave || action.payload;
        if (newLeave && newLeave._id) {
          if (!state.myLeaves.some((l) => l._id === newLeave._id)) {
            state.myLeaves.unshift(newLeave);
          }
          if (!state.leaves.some((l) => l._id === newLeave._id)) {
            state.leaves.unshift(newLeave);
          }
          if (newLeave.status === 'pending' && !state.pendingLeaves.some((l) => l._id === newLeave._id)) {
            state.pendingLeaves.unshift(newLeave);
          }
        }
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyLeaves
      .addCase(fetchMyLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.leaves || action.payload;
        state.myLeaves = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAllLeaves
      .addCase(fetchAllLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.leaves || action.payload;
        state.leaves = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchPendingLeaves
      .addCase(fetchPendingLeaves.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingLeaves.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.leaves || action.payload;
        state.pendingLeaves = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchPendingLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // approveLeave
      .addCase(approveLeave.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data?.data || action.payload.data?.leave;
        state.pendingLeaves = state.pendingLeaves.filter((l) => l._id !== action.payload.id);
        if (updated) {
          state.leaves = state.leaves.map((l) => (l._id === action.payload.id ? updated : l));
        } else {
          state.leaves = state.leaves.map((l) =>
            l._id === action.payload.id ? { ...l, status: 'approved' } : l
          );
        }
      })
      .addCase(approveLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // rejectLeave
      .addCase(rejectLeave.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data?.data || action.payload.data?.leave;
        state.pendingLeaves = state.pendingLeaves.filter((l) => l._id !== action.payload.id);
        if (updated) {
          state.leaves = state.leaves.map((l) => (l._id === action.payload.id ? updated : l));
        } else {
          state.leaves = state.leaves.map((l) =>
            l._id === action.payload.id ? { ...l, status: 'rejected' } : l
          );
        }
      })
      .addCase(rejectLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // cancelLeave
      .addCase(cancelLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = state.myLeaves.filter((l) => l._id !== action.payload.id);
        state.leaves = state.leaves.filter((l) => l._id !== action.payload.id);
      })

      // fetchLeaveBalance
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.leaveBalance = action.payload.data || action.payload.balance || action.payload;
      });
  }
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
