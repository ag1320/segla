import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFixedIncome,
  postFixedIncome,
  patchFixedIncome,
  deleteFixedIncome,
} from "../utilities/serverCalls";

export const loadFixedIncome = createAsyncThunk(
  "fixedIncome/loadFixedIncome",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchFixedIncome();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addFixedIncome = createAsyncThunk(
  "fixedIncome/addFixedIncome",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postFixedIncome(payload);
      dispatch(loadFixedIncome());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateFixedIncome = createAsyncThunk(
  "fixedIncome/updateFixedIncome",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchFixedIncome(payload);
      dispatch(loadFixedIncome());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFixedIncome = createAsyncThunk(
  "fixedIncome/removeFixedIncome",
  async (source, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteFixedIncome(source);
      dispatch(loadFixedIncome());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const fixedIncomeSlice = createSlice({
  name: "fixedIncome",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFixedIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFixedIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadFixedIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default fixedIncomeSlice.reducer;
