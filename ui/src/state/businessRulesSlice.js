import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessRules,
  postBusinessRule,
  patchBusinessRule,
  deleteBusinessRule,
  serverErrorMessage,
} from "../utilities/serverCalls";

export const loadBusinessRules = createAsyncThunk(
  "businessRules/loadBusinessRules",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessRules();
      return rows.map((row) => ({
        id: row.rule_id,
        descriptionPattern: row.description_pattern,
        accountId: row.account_id,
        propertyId: row.property_id,
        vendorId: row.vendor_id,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// rule: { descriptionPattern, accountId, propertyId, vendorId }
export const addBusinessRule = createAsyncThunk(
  "businessRules/addBusinessRule",
  async (rule, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessRule(rule);
      dispatch(loadBusinessRules());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const updateBusinessRule = createAsyncThunk(
  "businessRules/updateBusinessRule",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessRule(id, changes);
      dispatch(loadBusinessRules());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessRule = createAsyncThunk(
  "businessRules/removeBusinessRule",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessRule(id);
      dispatch(loadBusinessRules());
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessRulesSlice = createSlice({
  name: "businessRules",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessRules.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessRulesSlice.reducer;
