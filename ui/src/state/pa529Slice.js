import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPa529, postPa529, patchPa529, deletePa529 } from "../utilities/serverCalls";

export const loadPa529 = createAsyncThunk(
  "pa529/loadPa529",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchPa529();
      return items.map((item) => ({
        id: item.pa529_account_id,
        beneficiary: item.beneficiary,
        value: item.current_value,
        return: item.total_return,
        year: item.projected_college_year,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addPa529 = createAsyncThunk(
  "pa529/addPa529",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postPa529(payload);
      dispatch(loadPa529());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePa529 = createAsyncThunk(
  "pa529/updatePa529",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchPa529(payload);
      dispatch(loadPa529());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removePa529 = createAsyncThunk(
  "pa529/removePa529",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deletePa529(id);
      dispatch(loadPa529());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const pa529Slice = createSlice({
  name: "pa529",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPa529.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPa529.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadPa529.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default pa529Slice.reducer;
