import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTsp, postTsp, patchTsp, deleteTsp } from "../utilities/serverCalls";

export const loadTsp = createAsyncThunk(
  "tsp/loadTsp",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchTsp();
      // "display" shape (holder/type/return/...), see vanguardRetirementSlice note.
      return items.map((item) => ({
        id: item.tsp_account_id,
        holder: item.account_holder,
        type: item.account_type,
        value: item.current_value,
        return: item.total_return,
        contribution: item.my_contribution,
        govtContribution: item.govt_contribution,
        ytdReturn: item.ytd_return_percentage,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addTsp = createAsyncThunk(
  "tsp/addTsp",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postTsp(payload);
      dispatch(loadTsp());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTsp = createAsyncThunk(
  "tsp/updateTsp",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchTsp(payload);
      dispatch(loadTsp());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeTsp = createAsyncThunk(
  "tsp/removeTsp",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteTsp(id);
      dispatch(loadTsp());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const tspSlice = createSlice({
  name: "tsp",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTsp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTsp.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadTsp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tspSlice.reducer;
