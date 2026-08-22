import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotes,
  postNote,
  deleteNote,
  exportCSV as exportCSVCall,
} from "../utilities/serverCalls";

export const loadNotes = createAsyncThunk(
  "notes/loadNotes",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await fetchNotes(month, year);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addNote = createAsyncThunk(
  "notes/addNote",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postNote(payload);
      dispatch(loadNotes({ month: payload.month, year: payload.year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeNote = createAsyncThunk(
  "notes/removeNote",
  async ({ id, month, year }, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteNote(id);
      dispatch(loadNotes({ month, year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Exports the month's budget to CSV, and (the first time) logs an "Exported" note.
export const exportBudgetCSV = createAsyncThunk(
  "notes/exportBudgetCSV",
  async ({ month, year, isExported }, { dispatch, rejectWithValue }) => {
    try {
      const data = await exportCSVCall(month, year, isExported);
      dispatch(loadNotes({ month, year }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNotes: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotes } = notesSlice.actions;
export default notesSlice.reducer;
