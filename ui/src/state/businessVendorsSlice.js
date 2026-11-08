import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessVendors,
  postBusinessVendor,
  patchBusinessVendor,
  serverErrorMessage,
} from "../utilities/serverCalls";

export const loadBusinessVendors = createAsyncThunk(
  "businessVendors/loadBusinessVendors",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessVendors();
      return rows.map((row) => ({
        id: row.vendor_id,
        name: row.name,
        is1099Eligible: row.is_1099_eligible,
        hasW9OnFile: row.has_w9_on_file,
        w9Location: row.w9_location,
        isActive: row.is_active,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// vendor: { name, is1099Eligible, hasW9OnFile, w9Location, isActive }
export const addBusinessVendor = createAsyncThunk(
  "businessVendors/addBusinessVendor",
  async (vendor, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessVendor(vendor);
      dispatch(loadBusinessVendors());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const updateBusinessVendor = createAsyncThunk(
  "businessVendors/updateBusinessVendor",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessVendor(id, changes);
      dispatch(loadBusinessVendors());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessVendorsSlice = createSlice({
  name: "businessVendors",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessVendorsSlice.reducer;
