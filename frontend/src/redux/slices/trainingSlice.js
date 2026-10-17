import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

const initialState = {
  trainings: [],
  training: null,
  myTrainings: [],
  loading: false,
  error: null
};

export const fetchTrainings = createAsyncThunk(
  'trainings/fetchTrainings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/trainings', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch trainings');
    }
  }
);

export const fetchMyTrainings = createAsyncThunk(
  'trainings/fetchMyTrainings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trainings/my');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch my trainings');
    }
  }
);

export const fetchTraining = createAsyncThunk(
  'trainings/fetchTraining',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trainings/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch training');
    }
  }
);

export const createTraining = createAsyncThunk(
  'trainings/createTraining',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/trainings', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create training');
    }
  }
);

export const updateTraining = createAsyncThunk(
  'trainings/updateTraining',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/trainings/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update training');
    }
  }
);

export const deleteTraining = createAsyncThunk(
  'trainings/deleteTraining',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trainings/${id}`);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete training');
    }
  }
);

export const enrollEmployee = createAsyncThunk(
  'trainings/enrollEmployee',
  async ({ id, employeeId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/trainings/${id}/enroll`, { employeeId });
      return { id, employeeId, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to enroll in training');
    }
  }
);

const trainingSlice = createSlice({
  name: 'trainings',
  initialState,
  reducers: {
    clearTrainingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTrainings
      .addCase(fetchTrainings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainings.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.trainings || action.payload;
        state.trainings = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchTrainings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyTrainings
      .addCase(fetchMyTrainings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTrainings.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.trainings || action.payload;
        state.myTrainings = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchMyTrainings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchTraining
      .addCase(fetchTraining.fulfilled, (state, action) => {
        state.training = action.payload.data || action.payload.training || action.payload;
      })

      // createTraining
      .addCase(createTraining.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTraining.fulfilled, (state, action) => {
        state.loading = false;
        const newTraining = action.payload.data || action.payload.training || action.payload;
        if (newTraining && newTraining._id) {
          state.trainings.unshift(newTraining);
        }
      })
      .addCase(createTraining.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateTraining
      .addCase(updateTraining.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTraining.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload.training || action.payload;
        if (updated && updated._id) {
          state.trainings = state.trainings.map((t) => (t._id === updated._id ? updated : t));
        }
      })
      .addCase(updateTraining.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteTraining
      .addCase(deleteTraining.fulfilled, (state, action) => {
        state.loading = false;
        state.trainings = state.trainings.filter((t) => t._id !== action.payload.id);
      })

      // enrollEmployee
      .addCase(enrollEmployee.fulfilled, (state, action) => {
        const updated = action.payload.data?.data || action.payload.data?.training;
        if (updated && updated._id) {
          state.trainings = state.trainings.map((t) => (t._id === updated._id ? updated : t));
        }
      });
  }
});

export const { clearTrainingError } = trainingSlice.actions;
export default trainingSlice.reducer;
