import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBask, postBask, patchBask, deleteBask } from "../utilities/serverCalls";

export const loadBask = createAsyncThunk(
  "bask/loadBask",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchBask();
      return items.map((item) => ({
        id: item.bask_account_id,
        interestRate: item.interest_rate,
        value: item.current_value,
        return: item.total_return,
        ytdReturn: item.ytd_return,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addBask = createAsyncThunk(
  "bask/addBask",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBask(payload);
      dispatch(loadBask());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateBask = createAsyncThunk(
  "bask/updateBask",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBask(payload);
      dispatch(loadBask());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeBask = createAsyncThunk(
  "bask/removeBask",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteBask(id);
      dispatch(loadBask());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const baskSlice = createSlice({
  name: "bask",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default baskSlice.reducer;
