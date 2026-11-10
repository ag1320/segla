import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBusinessMarketEquity, serverErrorMessage } from "../utilities/serverCalls";

// The business at market value today: the Gettemy Properties line in
// personal net worth.
export const loadBusinessMarketEquity = createAsyncThunk(
  "businessMarketEquity/loadBusinessMarketEquity",
  async (_, { rejectWithValue }) => {
    try {
      // en-CA formats today as YYYY-MM-DD in the browser's timezone.
      const data = await fetchBusinessMarketEquity(new Date().toLocaleDateString("en-CA"));
      return {
        marketEquityCents: data.market_equity_cents,
        bookEquityCents: data.book_equity_cents,
        propertyAdjustmentCents: data.property_adjustment_cents,
        startupCostsCents: data.startup_costs_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const businessMarketEquitySlice = createSlice({
  name: "businessMarketEquity",
  initialState: {
    marketEquityCents: 0,
    bookEquityCents: 0,
    propertyAdjustmentCents: 0,
    startupCostsCents: 0,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessMarketEquity.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.error = null;
      })
      .addCase(loadBusinessMarketEquity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default businessMarketEquitySlice.reducer;
