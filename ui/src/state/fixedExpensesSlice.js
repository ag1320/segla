import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFixedExpenses,
  postFixedExpense,
  patchFixedExpense,
  deleteFixedExpense,
} from "../utilities/serverCalls";

export const loadFixedExpenses = createAsyncThunk(
  "fixedExpenses/loadFixedExpenses",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchFixedExpenses();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addFixedExpense = createAsyncThunk(
  "fixedExpenses/addFixedExpense",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postFixedExpense(payload);
      dispatch(loadFixedExpenses());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateFixedExpense = createAsyncThunk(
  "fixedExpenses/updateFixedExpense",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchFixedExpense(payload);
      dispatch(loadFixedExpenses());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFixedExpense = createAsyncThunk(
  "fixedExpenses/removeFixedExpense",
  async (category, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteFixedExpense(category);
      dispatch(loadFixedExpenses());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const fixedExpensesSlice = createSlice({
  name: "fixedExpenses",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFixedExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFixedExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadFixedExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default fixedExpensesSlice.reducer;
