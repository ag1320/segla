import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNetWorthSnapshots,
  postNetWorthSnapshot,
  deleteNetWorthSnapshot,
  fetchReportDataTotal,
} from "../utilities/serverCalls";

// Snapshots are written server-side automatically whenever an asset/loan
// is edited (plus a monthly floor) - this slice only reads them, plus the
// manual "Capture Now" and delete actions.
const transformSnapshot = (item) => ({
  id: item.snapshot_id,
  date: item.snapshot_date, // "YYYY-MM-DD"
  retirement: item.retirement,
  brokerage: item.brokerage,
  college: item.college,
  crypto: item.crypto,
  emergency: item.emergency,
  house: item.house,
  mortgage: item.mortgage,
  studentLoan: item.student_loan,
  autoLoan: item.auto_loan,
  totalAssets: item.total_assets,
  totalLiabilities: item.total_liabilities,
  netWorth: item.net_worth,
  source: item.source,
});

export const loadNetWorthSnapshots = createAsyncThunk(
  "netWorth/loadNetWorthSnapshots",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchNetWorthSnapshots();
      return items.map(transformSnapshot);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const captureNetWorthSnapshot = createAsyncThunk(
  "netWorth/captureNetWorthSnapshot",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await postNetWorthSnapshot();
      dispatch(loadNetWorthSnapshots());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeNetWorthSnapshot = createAsyncThunk(
  "netWorth/removeNetWorthSnapshot",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteNetWorthSnapshot(id);
      dispatch(loadNetWorthSnapshots());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const pad2 = (n) => String(n).padStart(2, "0");

// Monthly income/expense totals for the Savings Rate panel. Reuses the
// Budget report's /reportData?reason=total endpoint (every monthly_expenses
// row in a date range) rather than adding a new one; kept in this slice so
// it doesn't clobber the report modal's own state in reportsSlice.
export const loadMonthlyCashFlow = createAsyncThunk(
  "netWorth/loadMonthlyCashFlow",
  async (monthsBack = 12, { rejectWithValue }) => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      const startDateString = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-01`;
      const endDateString = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`;
      const rows = await fetchReportDataTotal(startDateString, endDateString);

      const byMonth = {};
      rows.forEach(({ amount, month, year, type }) => {
        // month is stored as a full name ("October")
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        const key = `${year}-${pad2(monthIndex + 1)}`;
        const entry = byMonth[key] || (byMonth[key] = { income: 0, fixedExpenses: 0, variedExpenses: 0 });
        const value = Number(amount) || 0;
        if (type === "income") entry.income += value;
        else if (type === "fixed expense") entry.fixedExpenses += value;
        else if (type === "varied expense") entry.variedExpenses += value;
      });
      return byMonth;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const netWorthSlice = createSlice({
  name: "netWorth",
  initialState: {
    snapshots: [],
    // { "YYYY-MM": { income, fixedExpenses, variedExpenses } }
    monthlyCashFlow: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadNetWorthSnapshots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNetWorthSnapshots.fulfilled, (state, action) => {
        state.loading = false;
        state.snapshots = action.payload;
      })
      .addCase(loadNetWorthSnapshots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadMonthlyCashFlow.fulfilled, (state, action) => {
        state.monthlyCashFlow = action.payload;
      });
  },
});

export default netWorthSlice.reducer;
