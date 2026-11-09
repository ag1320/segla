import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessProperties,
  postBusinessProperty,
  patchBusinessProperty,
  postBusinessConversionPreview,
  postBusinessConversion,
  serverErrorMessage,
} from "../utilities/serverCalls";
import { loadBusinessFixedAssets } from "./businessFixedAssetsSlice";
import { loadBusinessJournalEntries } from "./businessJournalEntriesSlice";

export const loadBusinessProperties = createAsyncThunk(
  "businessProperties/loadBusinessProperties",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessProperties();
      return rows.map((row) => ({
        id: row.property_id,
        entityId: row.entity_id,
        name: row.name,
        address: row.address,
        status: row.status,
        targetConversionDate: row.target_conversion_date,
        placedInServiceDate: row.placed_in_service_date,
        landBasisCents: row.land_basis_cents,
        buildingBasisCents: row.building_basis_cents,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// property: { entityId, name, address, status, targetConversionDate,
//   placedInServiceDate, landBasisCents, buildingBasisCents }
export const addBusinessProperty = createAsyncThunk(
  "businessProperties/addBusinessProperty",
  async (property, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessProperty(property);
      dispatch(loadBusinessProperties());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// changes: the same fields as a new property, except entityId
export const updateBusinessProperty = createAsyncThunk(
  "businessProperties/updateBusinessProperty",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessProperty(id, changes);
      dispatch(loadBusinessProperties());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const toConversion = (data) => ({
  basisCents: data.basis_cents,
  basisSource: data.basis_source,
  landCents: data.land_cents,
  buildingCents: data.building_cents,
  contributionCents: data.contribution_cents,
  lines: data.lines.map((line) => ({
    accountId: line.account_id,
    debitCents: line.debit_cents,
    creditCents: line.credit_cents,
  })),
});

// conversion: { placedInServiceDate, adjustedBasisCents, fairMarketValueCents,
//   landPercent, mortgageBalanceCents, escrowBalanceCents }
// A one-off read for the wizard's review step, so it isn't kept in the store.
export const previewBusinessConversion = createAsyncThunk(
  "businessProperties/previewBusinessConversion",
  async ({ propertyId, conversion }, { rejectWithValue }) => {
    try {
      return toConversion(await postBusinessConversionPreview(propertyId, conversion));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// Posting changes the property, its assets and the ledger, so all three
// reload.
export const convertBusinessProperty = createAsyncThunk(
  "businessProperties/convertBusinessProperty",
  async ({ propertyId, conversion }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessConversion(propertyId, conversion);
      dispatch(loadBusinessProperties());
      dispatch(loadBusinessFixedAssets());
      dispatch(loadBusinessJournalEntries({ accountId: getState().businessJournalEntries.accountId }));
      return toConversion(data);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessPropertiesSlice = createSlice({
  name: "businessProperties",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessPropertiesSlice.reducer;
