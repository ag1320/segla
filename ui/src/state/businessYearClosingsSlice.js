import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBusinessYearClosings, postBusinessYearClosing, serverErrorMessage } from "../utilities/serverCalls";
import { loadBusinessJournalEntries } from "./businessJournalEntriesSlice";

// The years closed so far (and not reopened), newest first.
export const loadBusinessYearClosings = createAsyncThunk(
  "businessYearClosings/loadBusinessYearClosings",
  async (entityId, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessYearClosings(entityId);
      return rows.map((row) => ({
        year: row.year,
        journalEntryId: row.journal_entry_id,
        entryDate: row.entry_date,
        netIncomeCents: row.net_income_cents,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

export const closeBusinessYear = createAsyncThunk(
  "businessYearClosings/closeBusinessYear",
  async ({ entityId, year }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await postBusinessYearClosing(entityId, year);
      dispatch(loadBusinessYearClosings(entityId));
      dispatch(loadBusinessJournalEntries({ accountId: getState().businessJournalEntries.accountId }));
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessYearClosingsSlice = createSlice({
  name: "businessYearClosings",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessYearClosings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessYearClosings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessYearClosings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessYearClosingsSlice.reducer;
