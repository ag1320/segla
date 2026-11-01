import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessAccounts,
  postBusinessAccount,
  patchBusinessAccount,
  serverErrorMessage,
} from "../utilities/serverCalls";

export const loadBusinessAccounts = createAsyncThunk(
  "businessAccounts/loadBusinessAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessAccounts();
      return rows.map((row) => ({
        id: row.account_id,
        number: row.account_number,
        name: row.name,
        type: row.account_type,
        scheduleELine: row.schedule_e_line,
        isActive: row.is_active,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// account: { accountNumber, name, accountType, scheduleELine }
export const addBusinessAccount = createAsyncThunk(
  "businessAccounts/addBusinessAccount",
  async (account, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBusinessAccount(account);
      dispatch(loadBusinessAccounts());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// changes: any of { name, scheduleELine, isActive }
export const updateBusinessAccount = createAsyncThunk(
  "businessAccounts/updateBusinessAccount",
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBusinessAccount(id, changes);
      dispatch(loadBusinessAccounts());
      return data;
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessAccountsSlice = createSlice({
  name: "businessAccounts",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessAccountsSlice.reducer;
