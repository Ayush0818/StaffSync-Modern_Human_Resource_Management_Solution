// ============================================================
// managerSlice.js - Redux Slice for Manager & Team State
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

const initialState = {
  managers: [],
  manager: null,
  myTeam: [],
  loading: false,
  error: null
};

// Fetch list of all managers
export const fetchManagers = createAsyncThunk(
  'managers/fetchManagers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/managers', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch managers');
    }
  }
);

// Fetch team members of the logged-in manager
export const fetchMyTeam = createAsyncThunk(
  'managers/fetchMyTeam',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/managers/my-team');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch team');
    }
  }
);

// Create / Register Manager — uses /auth/register with role:'manager'
export const createManager = createAsyncThunk(
  'managers/createManager',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { ...data, role: 'manager' });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create manager. Please check all fields and try again.');
    }
  }
);

// Add team member to manager
export const addTeamMember = createAsyncThunk(
  'managers/addTeamMember',
  async ({ managerId, employeeId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/managers/${managerId}/team/add`, { employeeId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to add team member');
    }
  }
);

// Remove team member from manager
export const removeTeamMember = createAsyncThunk(
  'managers/removeTeamMember',
  async ({ managerId, employeeId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/managers/${managerId}/team/remove`, { employeeId });
      return { managerId, employeeId, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to remove team member');
    }
  }
);

// Update Manager details
export const updateManager = createAsyncThunk(
  'managers/updateManager',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/managers/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update manager');
    }
  }
);

// Soft deactivate manager
export const deleteManager = createAsyncThunk(
  'managers/deleteManager',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/managers/${id}`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to deactivate manager');
    }
  }
);

// Permanently remove manager and user record from DB
export const hardDeleteManager = createAsyncThunk(
  'managers/hardDeleteManager',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/managers/${id}/permanent`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete manager permanently');
    }
  }
);

const managerSlice = createSlice({
  name: 'managers',
  initialState,
  reducers: {
    clearManagerError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchManagers
      .addCase(fetchManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.managers || action.payload;
        state.managers = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyTeam
      .addCase(fetchMyTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTeam.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.team || action.payload;
        state.myTeam = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchMyTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createManager
      .addCase(createManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManager.fulfilled, (state, action) => {
        state.loading = false;
        const newMgr = action.payload.data || action.payload.manager || action.payload;
        if (newMgr && newMgr._id) {
          state.managers.unshift(newMgr);
        }
      })
      .addCase(createManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addTeamMember
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTeam = action.payload.data || action.payload.team;
        if (Array.isArray(updatedTeam)) {
          state.myTeam = updatedTeam;
        }
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeTeamMember
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = state.myTeam.filter(
          (member) => member._id !== action.payload.employeeId && member.employee?._id !== action.payload.employeeId
        );
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateManager
      .addCase(updateManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateManager.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload.manager || action.payload;
        if (updated && updated._id) {
          state.managers = state.managers.map((m) =>
            m._id === updated._id ? updated : m
          );
          if (state.manager && state.manager._id === updated._id) {
            state.manager = updated;
          }
        }
      })
      .addCase(updateManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManager (soft deactivate)
      .addCase(deleteManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteManager.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = state.managers.map((m) =>
          m._id === action.payload.id ? { ...m, status: 'inactive' } : m
        );
      })
      .addCase(deleteManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // hardDeleteManager (permanent delete)
      .addCase(hardDeleteManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hardDeleteManager.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = state.managers.filter((m) => m._id !== action.payload.id);
      })
      .addCase(hardDeleteManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearManagerError } = managerSlice.actions;
export default managerSlice.reducer;
