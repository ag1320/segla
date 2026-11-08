import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBusinessPeriodLock, putBusinessPeriodLock, serverErrorMessage } from "../utilities/serverCalls";

const toPeriodLock = (row) => ({ entityId: row.entity_id, lockedThroughDate: row.locked_through_date });

export const loadBusinessPeriodLock = createAsyncThunk(
  "businessPeriodLocks/loadBusinessPeriodLock",
  async (entityId, { rejectWithValue }) => {
    try {
      return toPeriodLock(await fetchBusinessPeriodLock(entityId));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// lockedThroughDate: a month-end date, or null to reopen every month
export const saveBusinessPeriodLock = createAsyncThunk(
  "businessPeriodLocks/saveBusinessPeriodLock",
  async ({ entityId, lockedThroughDate }, { rejectWithValue }) => {
    try {
      return toPeriodLock(await putBusinessPeriodLock(entityId, lockedThroughDate));
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const storeLock = (state, action) => {
  state.lockedThroughDateByEntityId[action.payload.entityId] = action.payload.lockedThroughDate;
};

const businessPeriodLocksSlice = createSlice({
  name: "businessPeriodLocks",
  initialState: {
    lockedThroughDateByEntityId: {},
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessPeriodLock.fulfilled, storeLock)
      .addCase(loadBusinessPeriodLock.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(saveBusinessPeriodLock.fulfilled, storeLock);
  },
});

export default businessPeriodLocksSlice.reducer;
