import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessCapexPlan,
  postBusinessCapexComponent,
  patchBusinessCapexComponent,
  deleteBusinessCapexComponent,
  putBusinessCapexReserveAccount,
  serverErrorMessage,
} from "../utilities/serverCalls";

const toPlan = (data) => ({
  entityId: data.entity_id,
  asOfDate: data.as_of_date,
  reserveAccountId: data.reserve_account_id,
  reserveCents: data.reserve_cents,
  targetCents: data.target_cents,
  fundedRatio: data.funded_ratio,
  annualContributionCents: data.annual_contribution_cents,
  components: data.components.map((component) => ({
    id: component.capex_component_id,
    propertyId: component.property_id,
    propertyName: component.property_name,
    name: component.name,
    installYear: component.install_year,
    usefulLifeYears: component.useful_life_years,
    replacementCostCents: component.replacement_cost_cents,
    ageYears: component.age_years,
    nextReplacementYear: component.next_replacement_year,
    targetCents: component.target_cents,
    annualContributionCents: component.annual_contribution_cents,
  })),
  forecast: data.forecast.map((year) => ({
    year: year.year,
    components: year.components.map((component) => ({ id: component.capex_component_id, name: component.name })),
    replacementsCents: year.replacements_cents,
    projectedReserveCents: year.projected_reserve_cents,
  })),
});

// The whole entity's plan as of today, for the property tab and the
// reserve report alike.
export const loadBusinessCapexPlan = createAsyncThunk(
  "businessCapex/loadBusinessCapexPlan",
  async (entityId, { rejectWithValue }) => {
    try {
      // en-CA formats today as YYYY-MM-DD in the browser's timezone.
      const today = new Date().toLocaleDateString("en-CA");
      return toPlan(await fetchBusinessCapexPlan({ entityId, asOfDate: today }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// component: { propertyId, name, installYear, usefulLifeYears, replacementCostCents }
export const addBusinessCapexComponent = createAsyncThunk(
  "businessCapex/addBusinessCapexComponent",
  async ({ entityId, component }, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessCapexComponent(component);
      dispatch(loadBusinessCapexPlan(entityId));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const updateBusinessCapexComponent = createAsyncThunk(
  "businessCapex/updateBusinessCapexComponent",
  async ({ entityId, id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessCapexComponent(id, changes);
      dispatch(loadBusinessCapexPlan(entityId));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessCapexComponent = createAsyncThunk(
  "businessCapex/removeBusinessCapexComponent",
  async ({ entityId, id }, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessCapexComponent(id);
      dispatch(loadBusinessCapexPlan(entityId));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// accountId "" or null clears the reserve account.
export const saveBusinessCapexReserveAccount = createAsyncThunk(
  "businessCapex/saveBusinessCapexReserveAccount",
  async ({ entityId, accountId }, { dispatch, rejectWithValue }) => {
    try {
      await putBusinessCapexReserveAccount(entityId, accountId || null);
      dispatch(loadBusinessCapexPlan(entityId));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessCapexSlice = createSlice({
  name: "businessCapex",
  initialState: {
    plan: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessCapexPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessCapexPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plan = action.payload;
      })
      .addCase(loadBusinessCapexPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessCapexSlice.reducer;
