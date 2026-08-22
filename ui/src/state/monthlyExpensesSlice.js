import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMonthlyFixedExpenses,
  postMonthlyVariedExpense,
  fetchMonthlyVariedExpenses,
  deleteMonthlyVariedExpense,
} from "../utilities/serverCalls";

export const loadMonthlyFixedExpenses = createAsyncThunk(
  "monthlyExpenses/loadMonthlyFixedExpenses",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await fetchMonthlyFixedExpenses(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadMonthlyVariedExpenses = createAsyncThunk(
  "monthlyExpenses/loadMonthlyVariedExpenses",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await fetchMonthlyVariedExpenses(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addMonthlyVariedExpense = createAsyncThunk(
  "monthlyExpenses/addMonthlyVariedExpense",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postMonthlyVariedExpense(payload);
      dispatch(loadMonthlyVariedExpenses({ month: payload.month, year: payload.year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeMonthlyVariedExpense = createAsyncThunk(
  "monthlyExpenses/removeMonthlyVariedExpense",
  async ({ id, month, year }, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteMonthlyVariedExpense(id);
      dispatch(loadMonthlyVariedExpenses({ month, year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const monthlyExpensesSlice = createSlice({
  name: "monthlyExpenses",
  initialState: {
    fixedExpenses: [],
    variedExpenses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMonthlyExpenses: (state) => {
      state.fixedExpenses = [];
      state.variedExpenses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMonthlyFixedExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyFixedExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.fixedExpenses = action.payload;
      })
      .addCase(loadMonthlyFixedExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadMonthlyVariedExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyVariedExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.variedExpenses = action.payload;
      })
      .addCase(loadMonthlyVariedExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMonthlyExpenses } = monthlyExpensesSlice.actions;
export default monthlyExpensesSlice.reducer;
