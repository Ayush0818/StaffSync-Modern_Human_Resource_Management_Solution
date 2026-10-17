// ============================================================
// announcementSlice.js - Redux Slice for Company Announcements
// ============================================================
// This slice handles:
// 1. Fetching all announcements for employees and managers
// 2. Creating, updating, deleting announcements (HR)
// 3. Pinning important announcements to the top
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

const initialState = {
  announcements: [],
  announcement: null,
  loading: false,
  error: null
};

// 1. Fetch Announcements
export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/announcements', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch announcements');
    }
  }
);

// 2. Fetch Single Announcement
export const fetchAnnouncement = createAsyncThunk(
  'announcements/fetchAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch announcement');
    }
  }
);

// 3. Create Announcement (HR only)
export const createAnnouncement = createAsyncThunk(
  'announcements/createAnnouncement',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/announcements', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create announcement');
    }
  }
);

// 4. Update Announcement
export const updateAnnouncement = createAsyncThunk(
  'announcements/updateAnnouncement',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/announcements/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update announcement');
    }
  }
);

// 5. Delete Announcement
export const deleteAnnouncement = createAsyncThunk(
  'announcements/deleteAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete announcement');
    }
  }
);

// 6. Toggle Pin Status of Announcement
export const togglePin = createAsyncThunk(
  'announcements/togglePin',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/announcements/${id}/pin`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to toggle pin');
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncementError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAnnouncements
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.announcements || action.payload;
        state.announcements = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createAnnouncement
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        const newAnn = action.payload.data || action.payload.announcement || action.payload;
        if (newAnn && newAnn._id) {
          state.announcements.unshift(newAnn);
        }
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAnnouncement
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload.announcement || action.payload;
        if (updated && updated._id) {
          state.announcements = state.announcements.map((a) => (a._id === updated._id ? updated : a));
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteAnnouncement
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = state.announcements.filter((a) => a._id !== action.payload.id);
      })

      // togglePin
      .addCase(togglePin.fulfilled, (state, action) => {
        const updated = action.payload.data?.data || action.payload.data?.announcement;
        if (updated) {
          state.announcements = state.announcements.map((a) =>
            a._id === action.payload.id ? updated : a
          );
        } else {
          // Toggle locally if server just sent success message
          state.announcements = state.announcements.map((a) =>
            a._id === action.payload.id ? { ...a, isPinned: !a.isPinned } : a
          );
        }
      });
  }
});

export const { clearAnnouncementError } = announcementSlice.actions;
export default announcementSlice.reducer;
