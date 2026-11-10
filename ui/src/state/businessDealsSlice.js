import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessDeals,
  postBusinessDealAnalysis,
  postBusinessDeal,
  patchBusinessDeal,
  deleteBusinessDeal,
  serverErrorMessage,
} from "../utilities/serverCalls";

const toAnalysis = (data) => ({
  grossRentCents: data.gross_rent_cents,
  vacancyCents: data.vacancy_cents,
  effectiveGrossIncomeCents: data.effective_gross_income_cents,
  operatingExpensesCents: data.operating_expenses_cents,
  noiCents: data.noi_cents,
  downPaymentCents: data.down_payment_cents,
  loanCents: data.loan_cents,
  monthlyDebtServiceCents: data.monthly_debt_service_cents,
  debtServiceCents: data.debt_service_cents,
  cashFlowCents: data.cash_flow_cents,
  monthlyCashFlowCents: data.monthly_cash_flow_cents,
  cashInvestedCents: data.cash_invested_cents,
  capRate: data.cap_rate,
  cashOnCash: data.cash_on_cash,
  dscr: data.dscr,
  rentToPrice: data.rent_to_price,
  grossRentMultiplier: data.gross_rent_multiplier,
  breakEvenRatio: data.break_even_ratio,
});

// The API stores a deal's inputs as given (camelCase cents and percents).
const toDeal = (row) => ({
  id: row.deal_id,
  name: row.name,
  inputs: row.inputs,
  analysis: toAnalysis(row.analysis),
});

export const loadBusinessDeals = createAsyncThunk(
  "businessDeals/loadBusinessDeals",
  async (entityId, { rejectWithValue }) => {
    try {
      return (await fetchBusinessDeals(entityId)).map(toDeal);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// A one-off calculation for the editor, so it isn't kept in the store.
export const analyzeBusinessDeal = createAsyncThunk(
  "businessDeals/analyzeBusinessDeal",
  async (inputs, { rejectWithValue }) => {
    try {
      return toAnalysis(await postBusinessDealAnalysis(inputs));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// deal: { entityId, name, inputs }
export const addBusinessDeal = createAsyncThunk(
  "businessDeals/addBusinessDeal",
  async (deal, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessDeal(deal);
      dispatch(loadBusinessDeals(deal.entityId));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// changes: { name, inputs }, either or both
export const updateBusinessDeal = createAsyncThunk(
  "businessDeals/updateBusinessDeal",
  async ({ entityId, id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessDeal(id, changes);
      dispatch(loadBusinessDeals(entityId));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const removeBusinessDeal = createAsyncThunk(
  "businessDeals/removeBusinessDeal",
  async ({ entityId, id }, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessDeal(id);
      dispatch(loadBusinessDeals(entityId));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessDealsSlice = createSlice({
  name: "businessDeals",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessDealsSlice.reducer;
