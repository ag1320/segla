import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessJournalEntries,
  postBusinessJournalEntry,
  postBusinessJournalEntryReversal,
  serverErrorMessage,
} from "../utilities/serverCalls";

const toJournalEntry = (row) => ({
  id: row.journal_entry_id,
  entityId: row.entity_id,
  entryDate: row.entry_date,
  memo: row.memo,
  source: row.source,
  reversesId: row.reverses_journal_entry_id,
  reversedById: row.reversed_by_journal_entry_id,
  lines: row.lines.map((line) => ({
    id: line.journal_line_id,
    accountId: line.account_id,
    propertyId: line.property_id,
    vendorId: line.vendor_id,
    debitCents: line.debit_cents,
    creditCents: line.credit_cents,
    needsCpaReview: line.needs_cpa_review,
  })),
});

// accountId: null for every entry, or an account id for that account's
// register. The slice remembers it so a post or reversal reloads the same view.
export const loadBusinessJournalEntries = createAsyncThunk(
  "businessJournalEntries/loadBusinessJournalEntries",
  async ({ accountId }, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessJournalEntries({ accountId });
      return rows.map(toJournalEntry);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// entry: { entityId, entryDate, memo, lines: [{ accountId, propertyId,
//   debitCents, creditCents, needsCpaReview }] }
export const addBusinessJournalEntry = createAsyncThunk(
  "businessJournalEntries/addBusinessJournalEntry",
  async (entry, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessJournalEntry(entry);
      dispatch(loadBusinessJournalEntries({ accountId: getState().businessJournalEntries.accountId }));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const reverseBusinessJournalEntry = createAsyncThunk(
  "businessJournalEntries/reverseBusinessJournalEntry",
  async ({ id, entryDate }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessJournalEntryReversal(id, entryDate);
      dispatch(loadBusinessJournalEntries({ accountId: getState().businessJournalEntries.accountId }));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessJournalEntriesSlice = createSlice({
  name: "businessJournalEntries",
  initialState: {
    items: [],
    accountId: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessJournalEntries.pending, (state, action) => {
        state.accountId = action.meta.arg.accountId;
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessJournalEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessJournalEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessJournalEntriesSlice.reducer;
