import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { IApplicant } from '../../backend/src/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CandidatesState {
  applicants: Record<string, IApplicant[]>;
  loading: boolean;
  uploadLoading: boolean;
  error: string | null;
}

const initialState: CandidatesState = {
  applicants: {},
  loading: false,
  uploadLoading: false,
  error: null,
};

export const fetchApplicants = createAsyncThunk('candidates/fetchApplicants', async (jobId: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/applicants/${jobId}`);
    return { jobId, data: response.data };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch applicants');
  }
});

export const uploadApplicantsJSON = createAsyncThunk('candidates/uploadJSON', async ({ jobId, data }: { jobId: string; data: any[] }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/applicants/json/${jobId}`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload applicants');
  }
});

export const uploadCSVFile = createAsyncThunk('candidates/uploadCSV', async ({ jobId, file }: { jobId: string; file: File }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/applicants/csv/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload CSV');
  }
});

export const uploadPDFFile = createAsyncThunk('candidates/uploadPDF', async ({ jobId, file }: { jobId: string; file: File }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/applicants/pdf/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload PDF');
  }
});

export const deleteApplicant = createAsyncThunk('candidates/deleteApplicant', async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/applicants/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete applicant');
  }
});

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    clearApplicants: (state, action: PayloadAction<string>) => {
      state.applicants[action.payload] = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicants.fulfilled, (state, action: PayloadAction<{ jobId: string; data: IApplicant[] }>) => {
        state.loading = false;
        state.applicants[action.payload.jobId] = action.payload.data;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadApplicantsJSON.fulfilled, (state, action: PayloadAction<IApplicant[]>) => {
        const jobId = action.payload[0]?.jobId;
        if (jobId) {
          state.applicants[jobId] = [...(state.applicants[jobId] || []), ...action.payload];
        }
      })
      .addCase(uploadApplicantsJSON.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteApplicant.fulfilled, (state, action: PayloadAction<string>) => {
        Object.keys(state.applicants).forEach((jobId) => {
          state.applicants[jobId] = state.applicants[jobId].filter((a) => a._id !== action.payload);
        });
      });
  },
});

export const { clearApplicants } = candidatesSlice.actions;
export default candidatesSlice.reducer;
