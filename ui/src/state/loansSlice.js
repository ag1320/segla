import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchLoans, postLoans, patchLoans, deleteLoans } from "../utilities/serverCalls";

export const loadLoans = createAsyncThunk(
  "loans/loadLoans",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchLoans();
      return items.map((item) => ({
        id: item.loan_account_id,
        url: item.url,
        holder: item.account_holder,
        type: item.type,
        interestRate: item.interest_rate,
        payoffDate: item.payoff_date,
        monthlyPayment: item.monthly_payment,
        remainingBalance: item.remaining_balance,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addLoan = createAsyncThunk(
  "loans/addLoan",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postLoans(payload);
      dispatch(loadLoans());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateLoan = createAsyncThunk(
  "loans/updateLoan",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchLoans(payload);
      dispatch(loadLoans());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeLoan = createAsyncThunk(
  "loans/removeLoan",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteLoans(id);
      dispatch(loadLoans());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const loansSlice = createSlice({
  name: "loans",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default loansSlice.reducer;
