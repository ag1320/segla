import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessTrialBalance,
  fetchBusinessGeneralLedger,
  serverErrorMessage,
} from "../utilities/serverCalls";

const toAccountColumns = (row) => ({
  accountId: row.account_id,
  accountNumber: row.account_number,
  name: row.name,
  type: row.account_type,
});

// query: { entityId, asOfDate }
export const loadBusinessTrialBalance = createAsyncThunk(
  "businessReports/loadBusinessTrialBalance",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessTrialBalance(query);
      return {
        asOfDate: data.as_of_date,
        rows: data.rows.map((row) => ({
          ...toAccountColumns(row),
          debitCents: row.debit_cents,
          creditCents: row.credit_cents,
        })),
        totalDebitCents: data.total_debit_cents,
        totalCreditCents: data.total_credit_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, from, to }
export const loadBusinessGeneralLedger = createAsyncThunk(
  "businessReports/loadBusinessGeneralLedger",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessGeneralLedger(query);
      return {
        from: data.from,
        to: data.to,
        accounts: data.accounts.map((account) => ({
          ...toAccountColumns(account),
          openingBalanceCents: account.opening_balance_cents,
          closingBalanceCents: account.closing_balance_cents,
          lines: account.lines.map((line) => ({
            id: line.journal_line_id,
            journalEntryId: line.journal_entry_id,
            entryDate: line.entry_date,
            memo: line.memo,
            source: line.source,
            debitCents: line.debit_cents,
            creditCents: line.credit_cents,
            balanceCents: line.balance_cents,
          })),
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessReportsSlice = createSlice({
  name: "businessReports",
  initialState: {
    trialBalance: null,
    generalLedger: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessTrialBalance.fulfilled, (state, action) => {
        state.trialBalance = action.payload;
        state.error = null;
      })
      .addCase(loadBusinessTrialBalance.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loadBusinessGeneralLedger.fulfilled, (state, action) => {
        state.generalLedger = action.payload;
        state.error = null;
      })
      .addCase(loadBusinessGeneralLedger.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default businessReportsSlice.reducer;
