import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessLeases,
  postBusinessLease,
  patchBusinessLease,
  deleteBusinessLease,
  postBusinessDepositKept,
  serverErrorMessage,
} from "../utilities/serverCalls";
import { loadBusinessJournalEntries } from "./businessJournalEntriesSlice";

export const toLease = (row) => ({
  id: row.lease_id,
  propertyId: row.property_id,
  tenantName: row.tenant_name,
  unit: row.unit,
  startDate: row.start_date,
  endDate: row.end_date,
  moveOutDate: row.move_out_date,
  monthlyRentCents: row.monthly_rent_cents,
  depositCents: row.deposit_cents,
  status: row.status,
});

// Every lease, with its status as of today.
export const loadBusinessLeases = createAsyncThunk(
  "businessLeases/loadBusinessLeases",
  async (_, { rejectWithValue }) => {
    try {
      // en-CA formats today as YYYY-MM-DD in the browser's timezone.
      const today = new Date().toLocaleDateString("en-CA");
      return (await fetchBusinessLeases(today)).map(toLease);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// lease: { propertyId, tenantName, unit, startDate, endDate, moveOutDate,
//   monthlyRentCents, depositCents }
export const addBusinessLease = createAsyncThunk(
  "businessLeases/addBusinessLease",
  async (lease, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessLease(lease);
      dispatch(loadBusinessLeases());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// changes: the same fields as a new lease, except propertyId
export const updateBusinessLease = createAsyncThunk(
  "businessLeases/updateBusinessLease",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessLease(id, changes);
      dispatch(loadBusinessLeases());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessLease = createAsyncThunk(
  "businessLeases/removeBusinessLease",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessLease(id);
      dispatch(loadBusinessLeases());
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// Posts the part of the deposit kept as income.
export const keepBusinessDeposit = createAsyncThunk(
  "businessLeases/keepBusinessDeposit",
  async ({ id, entryDate, amountCents }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessDepositKept(id, { entryDate, amountCents });
      dispatch(loadBusinessJournalEntries({ accountId: getState().businessJournalEntries.accountId }));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessLeasesSlice = createSlice({
  name: "businessLeases",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessLeases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessLeases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessLeases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessLeasesSlice.reducer;
