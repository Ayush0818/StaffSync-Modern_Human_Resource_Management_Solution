// ============================================================
// employeeSlice.js - Redux Slice for Employees Management
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

const initialState = {
  employees: [],
  employee: null,
  myProfile: null,
  loading: false,
  error: null,
  total: 0
};

// Fetch list of employees (with optional search, department, status, page params)
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch employees');
    }
  }
);

// Fetch single employee by ID
export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch employee');
    }
  }
);

// Add new employee — uses /auth/register with role:'employee'
export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { ...data, role: 'employee' });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee. Please check all fields and try again.');
    }
  }
);

// Update existing employee
export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employees/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update employee');
    }
  }
);

// Soft delete / Deactivate employee (sets status=terminated)
export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate employee');
    }
  }
);

// Permanently remove employee and user account from DB
export const hardDeleteEmployee = createAsyncThunk(
  'employees/hardDeleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/employees/${id}/permanent`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee permanently');
    }
  }
);

// Fetch logged in employee profile
export const fetchMyProfile = createAsyncThunk(
  'employees/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees/profile/me');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch profile');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.employees || action.payload;
        state.employees = Array.isArray(payloadData) ? payloadData : (payloadData.employees || []);
        state.total = action.payload.total || action.payload.count || state.employees.length;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchEmployee
      .addCase(fetchEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload.data || action.payload.employee || action.payload;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createEmployee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const newEmp = action.payload.data || action.payload.employee || action.payload;
        if (newEmp && newEmp._id) {
          state.employees.unshift(newEmp);
          state.total += 1;
        }
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateEmployee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload.employee || action.payload;
        if (updated && updated._id) {
          state.employees = state.employees.map((emp) =>
            emp._id === updated._id ? updated : emp
          );
          if (state.employee && state.employee._id === updated._id) {
            state.employee = updated;
          }
          if (state.myProfile && state.myProfile._id === updated._id) {
            state.myProfile = updated;
          }
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteEmployee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        // On soft delete, update status to terminated instead of removing from list
        state.employees = state.employees.map((emp) =>
          emp._id === action.payload.id ? { ...emp, status: 'terminated' } : emp
        );
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // hardDeleteEmployee
      .addCase(hardDeleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hardDeleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter((emp) => emp._id !== action.payload.id);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(hardDeleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyProfile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload.data || action.payload.employee || action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
