import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessFixedAssets,
  postBusinessFixedAsset,
  patchBusinessFixedAsset,
  deleteBusinessFixedAsset,
  putBusinessCpaDepreciation,
  deleteBusinessCpaDepreciation,
  postBusinessDepreciationPosting,
  serverErrorMessage,
} from "../utilities/serverCalls";
import { loadBusinessJournalEntries } from "./businessJournalEntriesSlice";

const toFixedAsset = (row) => ({
  id: row.fixed_asset_id,
  propertyId: row.property_id,
  name: row.name,
  assetClass: row.asset_class,
  costCents: row.cost_cents,
  inServiceDate: row.in_service_date,
  disposalDate: row.disposal_date,
  carryoverFromFixedAssetId: row.carryover_from_fixed_asset_id,
  lifeMonths: row.life_months,
  accumulatedCents: row.estimated_accumulated_cents,
  bookValueCents: row.estimated_book_value_cents,
  years: row.years.map((year) => ({
    taxYear: year.tax_year,
    estimateCents: year.estimate_cents,
    cpaCents: year.cpa_cents,
    accumulatedCents: year.accumulated_cents,
    bookValueCents: year.book_value_cents,
  })),
});

// Each asset with where it stands today and its schedule by year.
export const loadBusinessFixedAssets = createAsyncThunk(
  "businessFixedAssets/loadBusinessFixedAssets",
  async (_, { rejectWithValue }) => {
    try {
      // en-CA formats today as YYYY-MM-DD in the browser's timezone.
      const today = new Date().toLocaleDateString("en-CA");
      return (await fetchBusinessFixedAssets(today)).map(toFixedAsset);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// fixedAsset: { propertyId, name, assetClass, costCents, inServiceDate, disposalDate }
export const addBusinessFixedAsset = createAsyncThunk(
  "businessFixedAssets/addBusinessFixedAsset",
  async (fixedAsset, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessFixedAsset(fixedAsset);
      dispatch(loadBusinessFixedAssets());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const updateBusinessFixedAsset = createAsyncThunk(
  "businessFixedAssets/updateBusinessFixedAsset",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessFixedAsset(id, changes);
      dispatch(loadBusinessFixedAssets());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessFixedAsset = createAsyncThunk(
  "businessFixedAssets/removeBusinessFixedAsset",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessFixedAsset(id);
      dispatch(loadBusinessFixedAssets());
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// amountCents null clears the CPA's figure, so the estimate applies again.
export const saveBusinessCpaDepreciation = createAsyncThunk(
  "businessFixedAssets/saveBusinessCpaDepreciation",
  async ({ id, taxYear, amountCents }, { dispatch, rejectWithValue }) => {
    try {
      if (amountCents === null) {
        await deleteBusinessCpaDepreciation(id, taxYear);
      } else {
        await putBusinessCpaDepreciation(id, taxYear, amountCents);
      }
      dispatch(loadBusinessFixedAssets());
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// Returns the entries posted (none when the books were already current).
export const postBusinessDepreciation = createAsyncThunk(
  "businessFixedAssets/postBusinessDepreciation",
  async ({ entityId, throughDate }, { dispatch, getState, rejectWithValue }) => {
    try {
      const entries = await postBusinessDepreciationPosting(entityId, throughDate);
      dispatch(loadBusinessJournalEntries({ accountId: getState().businessJournalEntries.accountId }));
      return entries;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessFixedAssetsSlice = createSlice({
  name: "businessFixedAssets",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessFixedAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessFixedAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessFixedAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessFixedAssetsSlice.reducer;
