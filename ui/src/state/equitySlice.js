import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchEquity, postEquity, patchEquity, deleteEquity } from "../utilities/serverCalls";

export const loadEquity = createAsyncThunk(
  "equity/loadEquity",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchEquity();
      return items.map((item) => ({
        id: item.equity_id,
        address: item.address,
        valuation: item.valuation,
        remainingBalance: item.remaining_balance,
        equity: item.valuation - item.remaining_balance,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addEquity = createAsyncThunk(
  "equity/addEquity",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postEquity(payload);
      dispatch(loadEquity());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEquity = createAsyncThunk(
  "equity/updateEquity",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchEquity(payload);
      dispatch(loadEquity());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeEquity = createAsyncThunk(
  "equity/removeEquity",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteEquity(id);
      dispatch(loadEquity());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const equitySlice = createSlice({
  name: "equity",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadEquity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEquity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadEquity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default equitySlice.reducer;
