// ============================================================
// attendanceSlice.js - Redux Slice for Attendance Management
// ============================================================
// This slice handles:
// 1. Employee Daily Check-in & Check-out
// 2. Fetching personal attendance history (Employee)
// 3. Fetching team / all employee attendance records (Manager / HR)
// 4. Monthly attendance summary (total present, absent, late, half-day)
// 5. Manual attendance marking by HR
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Initial state for attendance
const initialState = {
  records: [],         // List of attendance records
  todayRecord: null,   // Today's check-in/out record for current user
  summary: {           // Summary stats for current month
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    totalWorkingDays: 0
  },
  loading: false,      // Loading indicator for UI spinners
  error: null          // Error message if any API call fails
};

// 1. Employee Check In
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/checkin');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Check-in failed');
    }
  }
);

// 2. Employee Check Out
export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/attendance/checkout');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Check-out failed');
    }
  }
);

// 3. Fetch My Attendance History (For logged in employee)
export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMyAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/my', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch attendance');
    }
  }
);

// 4. Fetch All Attendance (For HR / Manager)
export const fetchAllAttendance = createAsyncThunk(
  'attendance/fetchAllAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/all', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch attendance');
    }
  }
);

// 5. Fetch Attendance for a specific employee
export const fetchEmployeeAttendance = createAsyncThunk(
  'attendance/fetchEmployeeAttendance',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attendance/employee/${id}`, { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch employee attendance');
    }
  }
);

// 6. Fetch Attendance Summary Statistics
export const fetchSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/summary', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch summary');
    }
  }
);

// 7. Manual Attendance Mark (HR Admin only)
export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put('/attendance/mark', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to mark attendance');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload.data || action.payload.attendance || action.payload;
        // Also add to records if not already in list
        if (state.todayRecord) {
          state.records.unshift(state.todayRecord);
        }
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload.attendance || action.payload;
        state.todayRecord = updated;
        state.records = state.records.map((r) => (r._id === updated._id ? updated : r));
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch My Attendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.attendance || action.payload;
        state.records = Array.isArray(payloadData) ? payloadData : (payloadData.records || []);
        // Check if today's record exists in the list
        const todayStr = new Date().toISOString().slice(0, 10);
        state.todayRecord = state.records.find(
          (r) => r.date && r.date.toString().slice(0, 10) === todayStr
        ) || null;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Attendance
      .addCase(fetchAllAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.attendance || action.payload;
        state.records = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Employee Attendance
      .addCase(fetchEmployeeAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.attendance || action.payload;
        state.records = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchEmployeeAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Summary
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data || action.payload.summary || action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark Attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const marked = action.payload.data || action.payload.attendance || action.payload;
        if (marked && marked._id) {
          const exists = state.records.find((r) => r._id === marked._id);
          if (exists) {
            state.records = state.records.map((r) => (r._id === marked._id ? marked : r));
          } else {
            state.records.unshift(marked);
          }
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
