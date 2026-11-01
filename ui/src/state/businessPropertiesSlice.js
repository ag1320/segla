import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessProperties,
  postBusinessProperty,
  patchBusinessProperty,
  serverErrorMessage,
} from "../utilities/serverCalls";

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
