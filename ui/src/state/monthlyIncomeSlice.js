import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMonthlyIncome,
  postMonthlyIncome,
  deleteMonthlyIncome,
} from "../utilities/serverCalls";

export const loadMonthlyIncome = createAsyncThunk(
  "monthlyIncome/loadMonthlyIncome",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await fetchMonthlyIncome(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addMonthlyIncome = createAsyncThunk(
  "monthlyIncome/addMonthlyIncome",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postMonthlyIncome(payload);
      dispatch(loadMonthlyIncome({ month: payload.month, year: payload.year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeMonthlyIncome = createAsyncThunk(
  "monthlyIncome/removeMonthlyIncome",
  async ({ id, month, year }, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteMonthlyIncome(id);
      dispatch(loadMonthlyIncome({ month, year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const monthlyIncomeSlice = createSlice({
  name: "monthlyIncome",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMonthlyIncome: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMonthlyIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadMonthlyIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMonthlyIncome } = monthlyIncomeSlice.actions;
export default monthlyIncomeSlice.reducer;
