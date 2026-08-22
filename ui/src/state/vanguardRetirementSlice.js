import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchVanguardRetirement,
  postVanguardRetirement,
  patchVanguardRetirement,
  deleteVanguardRetirement,
} from "../utilities/serverCalls";

export const loadVanguardRetirement = createAsyncThunk(
  "vanguardRetirement/loadVanguardRetirement",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchVanguardRetirement();
      // NOTE: this is the "display" shape the table/edit dialog expect
      // (holder/type/return/...), distinct from the accountHolder/accountType/...
      // shape the POST/PATCH payload uses - same split existed in the
      // original component, preserved here rather than "fixed".
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

export const addVanguardRetirement = createAsyncThunk(
  "vanguardRetirement/addVanguardRetirement",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postVanguardRetirement(payload);
      dispatch(loadVanguardRetirement());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateVanguardRetirement = createAsyncThunk(
  "vanguardRetirement/updateVanguardRetirement",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchVanguardRetirement(payload);
      dispatch(loadVanguardRetirement());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeVanguardRetirement = createAsyncThunk(
  "vanguardRetirement/removeVanguardRetirement",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteVanguardRetirement(id);
      dispatch(loadVanguardRetirement());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const vanguardRetirementSlice = createSlice({
  name: "vanguardRetirement",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadVanguardRetirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVanguardRetirement.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadVanguardRetirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vanguardRetirementSlice.reducer;
