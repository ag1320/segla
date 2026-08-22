import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCrypto,
  postCrypto,
  patchCrypto,
  deleteCrypto,
  fetchCryptoMarketData,
} from "../utilities/serverCalls";

// Loads the crypto holdings from our own DB and computes cost basis.
export const loadCrypto = createAsyncThunk(
  "crypto/loadCrypto",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const items = await fetchCrypto();
      const transformed = items.map((item) => ({
        id: item.crypto_id,
        ticker: item.ticker,
        name: item.name,
        url: item.url,
        shares: item.shares,
        totalSpent: item.total_spent,
        costBasis: (item.total_spent / item.shares).toFixed(2),
      }));
      // Pass the just-fetched items directly rather than dispatching and
      // letting loadCryptoMarketData re-read them from state - state hasn't
      // been updated with `transformed` yet at this point (this thunk hasn't
      // returned/fulfilled), so reading getState().crypto.items here would
      // race and see the stale (often empty) list.
      dispatch(loadCryptoMarketData(transformed));
      return transformed;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Merges in live market prices (CoinGecko) for the currently-loaded holdings.
export const loadCryptoMarketData = createAsyncThunk(
  "crypto/loadCryptoMarketData",
  async (itemsArg, { getState, rejectWithValue }) => {
    try {
      const items = itemsArg ?? getState().crypto.items;
      if (items.length === 0) return items;
      const idTags = items.map((crypto) =>
        crypto.name.replace(/\s+/g, "-").toLowerCase()
      );
      const marketData = await fetchCryptoMarketData(idTags);
      return items.map((crypto) => {
        const marketValue =
          marketData[crypto.name.replace(/\s+/g, "-").toLowerCase()]?.usd || 0;
        const currentValue = crypto.shares * marketValue;
        return {
          ...crypto,
          marketValue,
          value: currentValue,
          gains: currentValue - crypto.totalSpent,
        };
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCrypto = createAsyncThunk(
  "crypto/addCrypto",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await postCrypto(payload);
      dispatch(loadCrypto());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCrypto = createAsyncThunk(
  "crypto/updateCrypto",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patchCrypto(payload);
      dispatch(loadCrypto());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeCrypto = createAsyncThunk(
  "crypto/removeCrypto",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteCrypto(id);
      dispatch(loadCrypto());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const cryptoSlice = createSlice({
  name: "crypto",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCrypto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCrypto.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadCrypto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadCryptoMarketData.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default cryptoSlice.reducer;
