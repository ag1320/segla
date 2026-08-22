import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCurrentBudgetCategories,
  fetchBudgetCategories,
  patchBudgetCategories,
  deleteBudgetCategory,
  postBudgetCategory,
} from "../utilities/serverCalls";

// "current" = the master category list (budget_categories table)
export const loadCurrentBudgetCategories = createAsyncThunk(
  "budgetCategories/loadCurrentBudgetCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCurrentBudgetCategories();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// "snapshot" = the per-month snapshot (budget_categories_snapshot table)
export const loadBudgetCategories = createAsyncThunk(
  "budgetCategories/loadBudgetCategories",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await fetchBudgetCategories(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateBudgetCategoriesRange = createAsyncThunk(
  "budgetCategories/updateBudgetCategoriesRange",
  async (budgetRange, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchBudgetCategories(budgetRange);
      dispatch(loadCurrentBudgetCategories());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeBudgetCategory = createAsyncThunk(
  "budgetCategories/removeBudgetCategory",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteBudgetCategory(id);
      dispatch(loadCurrentBudgetCategories());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addBudgetCategory = createAsyncThunk(
  "budgetCategories/addBudgetCategory",
  async ({ category, range }, { dispatch, rejectWithValue }) => {
    try {
      const data = await postBudgetCategory(category, range);
      dispatch(loadCurrentBudgetCategories());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const budgetCategoriesSlice = createSlice({
  name: "budgetCategories",
  initialState: {
    currentCategories: [],
    snapshotCategories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSnapshotCategories: (state) => {
      state.snapshotCategories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentBudgetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCurrentBudgetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategories = action.payload;
      })
      .addCase(loadCurrentBudgetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadBudgetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBudgetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.snapshotCategories = action.payload;
      })
      .addCase(loadBudgetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSnapshotCategories } = budgetCategoriesSlice.actions;
export default budgetCategoriesSlice.reducer;
