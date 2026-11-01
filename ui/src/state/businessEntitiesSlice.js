import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBusinessEntities, serverErrorMessage } from "../utilities/serverCalls";

export const loadBusinessEntities = createAsyncThunk(
  "businessEntities/loadBusinessEntities",
  async (_, { rejectWithValue }) => {
    try {
      const rows = await fetchBusinessEntities();
      return rows.map((row) => ({
        id: row.entity_id,
        name: row.name,
        type: row.entity_type,
      }));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessEntitiesSlice = createSlice({
  name: "businessEntities",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBusinessEntities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBusinessEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessEntitiesSlice.reducer;
