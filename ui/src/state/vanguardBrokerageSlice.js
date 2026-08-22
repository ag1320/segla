import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchVanguardBrokerage,
  postVanguardBrokerage,
  patchVanguardBrokerage,
  deleteVanguardBrokerage,
} from "../utilities/serverCalls";

export const loadVanguardBrokerage = createAsyncThunk(
  "vanguardBrokerage/loadVanguardBrokerage",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchVanguardBrokerage();
      // "display" shape (holder/type/return/...), see vanguardRetirementSlice note.
      return items.map((item) => ({
        id: item.vanguard_account_id,
        holder: item.account_holder,
        type: item.account_type,
        value: item.current_value,
        return: item.total_return,
        totalReturn: item.total_return_percentage,
        ytdReturn: item.ytd_return_percentage,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addVanguardBrokerage = createAsyncThunk(
  "vanguardBrokerage/addVanguardBrokerage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postVanguardBrokerage(payload);
      dispatch(loadVanguardBrokerage());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateVanguardBrokerage = createAsyncThunk(
  "vanguardBrokerage/updateVanguardBrokerage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchVanguardBrokerage(payload);
      dispatch(loadVanguardBrokerage());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeVanguardBrokerage = createAsyncThunk(
  "vanguardBrokerage/removeVanguardBrokerage",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteVanguardBrokerage(id);
      dispatch(loadVanguardBrokerage());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const vanguardBrokerageSlice = createSlice({
  name: "vanguardBrokerage",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadVanguardBrokerage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVanguardBrokerage.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadVanguardBrokerage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vanguardBrokerageSlice.reducer;
