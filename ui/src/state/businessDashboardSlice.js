import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBusinessDashboard, serverErrorMessage } from "../utilities/serverCalls";
import { loadBusinessEntities } from "./businessEntitiesSlice";

const toDashboard = (data) => ({
  phase: data.phase,
  marketEquityCents: data.market_equity_cents,
  cashCents: data.cash_cents,
  cardOwedCents: data.card_owed_cents,
  contributedCents: data.contributed_cents,
  drawnCents: data.drawn_cents,
  spentCents: data.spent_cents,
  daysToConversion: data.days_to_conversion,
  operating: data.operating && {
    noiYtdCents: data.operating.noi_ytd_cents,
    cashFlowThisMonthCents: data.operating.cash_flow_this_month_cents,
    occupancy: data.operating.occupancy,
    dscr: data.operating.dscr,
    capexFundedRatio: data.operating.capex_funded_ratio,
  },
  alerts: {
    inboxCount: data.alerts.inbox_count,
    unreconciledAccounts: data.alerts.unreconciled_accounts.map((account) => ({
      bankAccountId: account.bank_account_id,
      name: account.name,
      reconciledThrough: account.reconciled_through,
    })),
    cpaFlagCount: data.alerts.cpa_flag_count,
    leasesEnding: data.alerts.leases_ending.map((lease) => ({
      leaseId: lease.lease_id,
      tenantName: lease.tenant_name,
      endDate: lease.end_date,
    })),
  },
});

// Today's dashboard for the first entity (Gettemy Properties). Loads the
// entities first so the Home tile can use it on its own.
export const loadBusinessDashboard = createAsyncThunk(
  "businessDashboard/loadBusinessDashboard",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const entities = await dispatch(loadBusinessEntities()).unwrap();
      if (entities.length === 0) return null;
      // en-CA formats today as YYYY-MM-DD in the browser's timezone.
      const today = new Date().toLocaleDateString("en-CA");
      return toDashboard(await fetchBusinessDashboard({ entityId: entities[0].id, asOfDate: today }));
    } catch (err) {
      return rejectWithValue(typeof err === "string" ? err : serverErrorMessage(err));
    }
  }
);

const businessDashboardSlice = createSlice({
  name: "businessDashboard",
  initialState: {
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessDashboard.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loadBusinessDashboard.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default businessDashboardSlice.reducer;
