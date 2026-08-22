import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkBudget, postBudget, deleteBudget } from "../utilities/serverCalls";

// Returns any existing monthly_expenses rows for month/year - used to decide
// whether a budget already exists before seeding a new one.
export const checkExistingBudget = createAsyncThunk(
  "budget/checkExistingBudget",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await checkBudget(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Seeds a new month's budget from the fixed expenses/income + current categories.
export const seedBudget = createAsyncThunk(
  "budget/seedBudget",
  async (payload, { rejectWithValue }) => {
    try {
      return await postBudget(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteBudgetMonth = createAsyncThunk(
  "budget/deleteBudgetMonth",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await deleteBudget(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const budgetSlice = createSlice({
  name: "budget",
  initialState: {
    date: null,
    reason: "Budget",
    newBudget: false,
    openInstructions: false,
    // Forces a same-month reload after seeding/deleting/exporting a budget
    // (cases where nothing in the domain slices themselves changed enough
    // to self-trigger a reload - unlike ordinary add/edit/delete, which each
    // already reload their own slice via the thunk itself).
    budgetRefresh: false,
    loading: false,
    error: null,
  },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setReason: (state, action) => {
      state.reason = action.payload;
    },
    setNewBudget: (state, action) => {
      state.newBudget = action.payload;
    },
    setOpenInstructions: (state, action) => {
      state.openInstructions = action.payload;
    },
    toggleBudgetRefresh: (state) => {
      state.budgetRefresh = !state.budgetRefresh;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkExistingBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkExistingBudget.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkExistingBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(seedBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(seedBudget.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(seedBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBudgetMonth.fulfilled, (state) => {
        state.date = null;
      });
  },
});

export const { setDate, setReason, setNewBudget, setOpenInstructions, toggleBudgetRefresh } = budgetSlice.actions;
export default budgetSlice.reducer;
