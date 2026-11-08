import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessMortgages,
  postBusinessMortgage,
  patchBusinessMortgage,
  deleteBusinessMortgage,
  fetchBusinessMortgageSchedule,
  fetchBusinessMortgagePaymentSplit,
  serverErrorMessage,
} from "../utilities/serverCalls";

const toMortgage = (row) => ({
  id: row.mortgage_id,
  propertyId: row.property_id,
  lender: row.lender,
  originalPrincipalCents: row.original_principal_cents,
  annualRatePercent: row.annual_rate_percent,
  termMonths: row.term_months,
  firstPaymentDate: row.first_payment_date,
  monthlyEscrowCents: row.monthly_escrow_cents,
  monthlyPaymentCents: row.monthly_payment_cents,
});

const toScheduleRow = (row) => ({
  number: row.number,
  dueDate: row.due_date,
  interestCents: row.interest_cents,
  principalCents: row.principal_cents,
  escrowCents: row.escrow_cents,
  totalCents: row.total_cents,
  balanceCents: row.balance_cents,
});

export const loadBusinessMortgages = createAsyncThunk(
  "businessMortgages/loadBusinessMortgages",
  async (_, { rejectWithValue }) => {
    try {
      return (await fetchBusinessMortgages()).map(toMortgage);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const loadBusinessMortgageSchedule = createAsyncThunk(
  "businessMortgages/loadBusinessMortgageSchedule",
  async (mortgageId, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessMortgageSchedule(mortgageId);
      return { mortgageId, rows: data.rows.map(toScheduleRow) };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// Reloads the list and that mortgage's schedule, since new terms mean a
// new schedule.
const reloadAfterSave = (dispatch, mortgageId) => {
  dispatch(loadBusinessMortgages());
  dispatch(loadBusinessMortgageSchedule(mortgageId));
};

// mortgage: { propertyId, lender, originalPrincipalCents, annualRatePercent,
//   termMonths, firstPaymentDate, monthlyEscrowCents }
export const addBusinessMortgage = createAsyncThunk(
  "businessMortgages/addBusinessMortgage",
  async (mortgage, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessMortgage(mortgage);
      reloadAfterSave(dispatch, data.mortgage_id);
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// changes: the same terms as a new mortgage, except propertyId
export const updateBusinessMortgage = createAsyncThunk(
  "businessMortgages/updateBusinessMortgage",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessMortgage(id, changes);
      reloadAfterSave(dispatch, id);
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessMortgage = createAsyncThunk(
  "businessMortgages/removeBusinessMortgage",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessMortgage(id);
      dispatch(loadBusinessMortgages());
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// A one-off read for the Categorize form, so it isn't kept in the store.
export const loadBusinessMortgagePaymentSplit = createAsyncThunk(
  "businessMortgages/loadBusinessMortgagePaymentSplit",
  async ({ mortgageId, date }, { rejectWithValue }) => {
    try {
      const row = await fetchBusinessMortgagePaymentSplit(mortgageId, date);
      return {
        ...toScheduleRow(row),
        propertyId: row.property_id,
        interestAccountId: row.interest_account_id,
        principalAccountId: row.principal_account_id,
        escrowAccountId: row.escrow_account_id,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessMortgagesSlice = createSlice({
  name: "businessMortgages",
  initialState: {
    items: [],
    schedules: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessMortgages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessMortgages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessMortgages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadBusinessMortgageSchedule.fulfilled, (state, action) => {
        state.schedules[action.payload.mortgageId] = action.payload.rows;
      })
      .addCase(loadBusinessMortgageSchedule.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default businessMortgagesSlice.reducer;
