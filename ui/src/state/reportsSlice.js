import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchReportData,
  fetchReportDataTotal,
  fetchReportDataWarningsAndLimits,
} from "../utilities/serverCalls";

export const loadReportData = createAsyncThunk(
  "reports/loadReportData",
  async ({ startDateString, endDateString, formattedCategories }, { rejectWithValue }) => {
    try {
      return await fetchReportData(startDateString, endDateString, formattedCategories);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadReportDataTotal = createAsyncThunk(
  "reports/loadReportDataTotal",
  async ({ startDateString, endDateString }, { rejectWithValue }) => {
    try {
      return await fetchReportDataTotal(startDateString, endDateString);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadReportDataWarningsAndLimits = createAsyncThunk(
  "reports/loadReportDataWarningsAndLimits",
  async ({ startDateString, endDateString, formattedCategories }, { rejectWithValue }) => {
    try {
      return await fetchReportDataWarningsAndLimits(startDateString, endDateString, formattedCategories);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    data: [],
    totalData: [],
    warningsAndLimitsData: [],
    // Report-generation form state, shared between GenerateReportModal
    // (which sets it) and ReportModal (which reads it to build labels) -
    // these are siblings, not parent/child, so this can't be local state.
    reportStartDate: null,
    reportEndDate: null,
    reportSelectedCategories: [],
    reportSelectedTypeCategories: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReportStartDate: (state, action) => {
      state.reportStartDate = action.payload;
    },
    setReportEndDate: (state, action) => {
      state.reportEndDate = action.payload;
    },
    setReportSelectedCategories: (state, action) => {
      state.reportSelectedCategories = action.payload;
    },
    setReportSelectedTypeCategories: (state, action) => {
      state.reportSelectedTypeCategories = action.payload;
    },
    clearReportData: (state) => {
      state.data = [];
      state.totalData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadReportDataTotal.fulfilled, (state, action) => {
        state.totalData = action.payload;
      })
      .addCase(loadReportDataWarningsAndLimits.fulfilled, (state, action) => {
        state.warningsAndLimitsData = action.payload;
      });
  },
});

export const {
  setReportStartDate,
  setReportEndDate,
  setReportSelectedCategories,
  setReportSelectedTypeCategories,
  clearReportData,
} = reportsSlice.actions;
export default reportsSlice.reducer;
