import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBusinessBankAccounts, serverErrorMessage } from "../utilities/serverCalls";

export const loadBusinessBankAccounts = createAsyncThunk(
  "businessBankAccounts/loadBusinessBankAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessBankAccounts();
      return rows.map((row) => ({
        id: row.bank_account_id,
        entityId: row.entity_id,
        accountId: row.account_id,
        name: row.name,
        institution: row.institution,
        lastFour: row.last_four,
        importFormat: row.import_format,
        isActive: row.is_active,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessBankAccountsSlice = createSlice({
  name: "businessBankAccounts",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessBankAccountsSlice.reducer;
