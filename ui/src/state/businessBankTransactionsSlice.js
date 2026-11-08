import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  postBusinessBankImport,
  fetchBusinessBankTransactions,
  patchBusinessBankTransaction,
  postBusinessBankTransactionEntry,
  postBusinessBankTransfer,
  serverErrorMessage,
} from "../utilities/serverCalls";
import { loadBusinessRules } from "./businessRulesSlice";

// Inbox rows also carry suggestedRuleId and transferCandidateIds (the other
// side of a possible transfer); other lists don't.
const toBankTransaction = (row) => ({
  id: row.bank_transaction_id,
  bankAccountId: row.bank_account_id,
  transactionDate: row.transaction_date,
  description: row.description,
  amountCents: row.amount_cents,
  status: row.status,
  journalEntryId: row.journal_entry_id,
  suggestedRuleId: row.suggested_rule_id ?? null,
  transferCandidateIds: row.transfer_candidate_ids ?? [],
});

// status: "new" for the Inbox, or "excluded". The slice remembers it so an
// import, post or exclusion reloads the same list.
export const loadBusinessBankTransactions = createAsyncThunk(
  "businessBankTransactions/loadBusinessBankTransactions",
  async ({ status }, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessBankTransactions({ status });
      return rows.map(toBankTransaction);
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const reloadSameList = (dispatch, getState) =>
  dispatch(loadBusinessBankTransactions({ status: getState().businessBankTransactions.status }));

// Resolves to { importedCount, alreadyImportedCount }.
export const importBusinessBankCsv = createAsyncThunk(
  "businessBankTransactions/importBusinessBankCsv",
  async ({ bankAccountId, csv }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessBankImport(bankAccountId, csv);
      reloadSameList(dispatch, getState);
      return {
        importedCount: data.imported_count,
        alreadyImportedCount: data.already_imported_count,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// splits: [{ accountId, propertyId, vendorId, amountCents, needsCpaReview }]
// saveRule: { descriptionPattern }, or undefined to post without one
export const postBusinessBankTransaction = createAsyncThunk(
  "businessBankTransactions/postBusinessBankTransaction",
  async ({ id, memo, splits, saveRule }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessBankTransactionEntry(id, { memo, splits, saveRule });
      reloadSameList(dispatch, getState);
      if (saveRule) dispatch(loadBusinessRules());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// Posts two imported transactions (money leaving one account and arriving
// in the other) as one transfer entry.
export const postBusinessBankTransferPair = createAsyncThunk(
  "businessBankTransactions/postBusinessBankTransferPair",
  async ({ id, otherId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessBankTransfer(id, otherId);
      reloadSameList(dispatch, getState);
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// status: "excluded" to set a transaction aside, "new" to restore it.
export const changeBusinessBankTransactionStatus = createAsyncThunk(
  "businessBankTransactions/changeBusinessBankTransactionStatus",
  async ({ id, status }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await patchBusinessBankTransaction(id, { status });
      reloadSameList(dispatch, getState);
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessBankTransactionsSlice = createSlice({
  name: "businessBankTransactions",
  initialState: {
    items: [],
    status: "new",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessBankTransactions.pending, (state, action) => {
        state.status = action.meta.arg.status;
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessBankTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessBankTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessBankTransactionsSlice.reducer;
