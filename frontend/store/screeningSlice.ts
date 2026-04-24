import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { IScreening, IScreeningResult } from '../../backend/src/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ScreeningState {
  results: Record<string, IScreening | null>;
  loading: boolean;
  error: string | null;
  lastScreenedTimestamp: Record<string, number | null>;
}

const initialState: ScreeningState = {
  results: {},
  loading: false,
  error: null,
  lastScreenedTimestamp: {},
};

export const triggerAIScreening = createAsyncThunk('screening/trigger', async ({ jobId, shortlistSize }: { jobId: string; shortlistSize: 10 | 20 }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/screening/run`, { jobId, shortlistSize });
    return response.data as IScreening;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'AI screening failed');
  }
});

export const fetchScreening = createAsyncThunk('screening/fetch', async (screeningId: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/screening/${screeningId}`);
    return response.data as IScreening;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch screening');
  }
});

export const fetchScreeningsByJob = createAsyncThunk('screening/fetchByJob', async (jobId: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/screening/job/${jobId}`);
    return { jobId, data: response.data } as { jobId: string; data: IScreening[] };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch screenings');
  }
});

const screeningSlice = createSlice({
  name: 'screening',
  initialState,
  reducers: {
    clearScreening: (state, action: PayloadAction<string>) => {
      state.results[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerAIScreening.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(triggerAIScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.results[action.payload._id!] = action.payload;
        state.lastScreenedTimestamp[action.payload.jobId!] = Date.now();
      })
      .addCase(triggerAIScreening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchScreening.fulfilled, (state, action) => {
        state.results[action.payload._id!] = action.payload;
      })
      .addCase(fetchScreeningsByJob.fulfilled, (state, action) => {
        action.payload.data.forEach((screening) => {
          state.results[screening._id!] = screening;
        });
      });
  },
});

export const { clearScreening } = screeningSlice.actions;
export default screeningSlice.reducer;
