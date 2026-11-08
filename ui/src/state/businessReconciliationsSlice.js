import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessReconciliations,
  fetchBusinessReconciliationWorksheet,
  postBusinessReconciliation,
  deleteBusinessReconciliation,
  serverErrorMessage,
} from "../utilities/serverCalls";

// Every account's reconciliations, newest statement first within an account.
export const loadBusinessReconciliations = createAsyncThunk(
  "businessReconciliations/loadBusinessReconciliations",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessReconciliations();
      return rows.map((row) => ({
        id: row.reconciliation_id,
        bankAccountId: row.bank_account_id,
        statementDate: row.statement_date,
        statementBalanceCents: row.statement_balance_cents,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// The open lines for one statement, plus where the last statement left off.
export const loadReconciliationWorksheet = createAsyncThunk(
  "businessReconciliations/loadReconciliationWorksheet",
  async ({ bankAccountId, statementDate }, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessReconciliationWorksheet(bankAccountId, statementDate);
      return {
        bankAccountId,
        statementDate,
        lastStatementDate: data.last_statement_date,
        startingBalanceCents: data.starting_balance_cents,
        lines: data.lines.map((line) => ({
          id: line.journal_line_id,
          journalEntryId: line.journal_entry_id,
          entryDate: line.entry_date,
          memo: line.memo,
          amountCents: line.amount_cents,
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// reconciliation: { bankAccountId, statementDate, statementBalanceCents, clearedLineIds }
export const addBusinessReconciliation = createAsyncThunk(
  "businessReconciliations/addBusinessReconciliation",
  async (reconciliation, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessReconciliation(reconciliation);
      dispatch(loadBusinessReconciliations());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const undoBusinessReconciliation = createAsyncThunk(
  "businessReconciliations/undoBusinessReconciliation",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteBusinessReconciliation(id);
      dispatch(loadBusinessReconciliations());
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessReconciliationsSlice = createSlice({
  name: "businessReconciliations",
  initialState: {
    items: [],
    worksheet: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessReconciliations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessReconciliations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessReconciliations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadReconciliationWorksheet.pending, (state) => {
        state.worksheet = null;
      })
      .addCase(loadReconciliationWorksheet.fulfilled, (state, action) => {
        state.worksheet = action.payload;
      });
  },
});

export default businessReconciliationsSlice.reducer;
