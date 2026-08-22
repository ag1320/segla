import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMonthEndDistributions,
  postMonthEndDistribution,
  deleteMonthEndDistribution,
} from "../utilities/serverCalls";

export const loadMonthEndDistributions = createAsyncThunk(
  "monthEndDistributions/loadMonthEndDistributions",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await fetchMonthEndDistributions(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addMonthEndDistribution = createAsyncThunk(
  "monthEndDistributions/addMonthEndDistribution",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postMonthEndDistribution(payload);
      dispatch(loadMonthEndDistributions({ month: payload.month, year: payload.year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeMonthEndDistribution = createAsyncThunk(
  "monthEndDistributions/removeMonthEndDistribution",
  async ({ id, month, year }, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteMonthEndDistribution(id);
      dispatch(loadMonthEndDistributions({ month, year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const monthEndDistributionsSlice = createSlice({
  name: "monthEndDistributions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMonthEndDistributions: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMonthEndDistributions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthEndDistributions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadMonthEndDistributions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMonthEndDistributions } = monthEndDistributionsSlice.actions;
export default monthEndDistributionsSlice.reducer;
