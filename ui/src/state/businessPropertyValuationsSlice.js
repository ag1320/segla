import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessPropertyValuations,
  postBusinessPropertyValuation,
  patchBusinessPropertyValuation,
  deleteBusinessPropertyValuation,
  serverErrorMessage,
} from "../utilities/serverCalls";

// One property's valuations at a time, oldest first.
export const loadBusinessPropertyValuations = createAsyncThunk(
  "businessPropertyValuations/loadBusinessPropertyValuations",
  async (propertyId, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessPropertyValuations(propertyId);
      return {
        propertyId,
        items: rows.map((row) => ({
          id: row.property_valuation_id,
          propertyId: row.property_id,
          valuationDate: row.valuation_date,
          valueCents: row.value_cents,
          source: row.source,
          note: row.note,
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// valuation: { valuationDate, valueCents, source, note }
export const addBusinessPropertyValuation = createAsyncThunk(
  "businessPropertyValuations/addBusinessPropertyValuation",
  async ({ propertyId, valuation }, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessPropertyValuation(propertyId, valuation);
      dispatch(loadBusinessPropertyValuations(propertyId));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const updateBusinessPropertyValuation = createAsyncThunk(
  "businessPropertyValuations/updateBusinessPropertyValuation",
  async ({ id, propertyId, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessPropertyValuation(id, changes);
      dispatch(loadBusinessPropertyValuations(propertyId));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessPropertyValuation = createAsyncThunk(
  "businessPropertyValuations/removeBusinessPropertyValuation",
  async ({ id, propertyId }, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessPropertyValuation(id);
      dispatch(loadBusinessPropertyValuations(propertyId));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessPropertyValuationsSlice = createSlice({
  name: "businessPropertyValuations",
  initialState: {
    propertyId: null,
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessPropertyValuations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessPropertyValuations.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyId = action.payload.propertyId;
        state.items = action.payload.items;
      })
      .addCase(loadBusinessPropertyValuations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessPropertyValuationsSlice.reducer;
