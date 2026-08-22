import { createSlice } from "@reduxjs/toolkit";

// Holds cross-app UI flags that AppContext used to carry (currently just the
// snackbar). Not a 1:1 Polyglot equivalent - Polyglot has no snackbar - but
// it follows the same slice shape as every other slice in this store.
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    snackbarSuccess: false,
    snackbarError: false,
  },
  reducers: {
    setSnackbarSuccess: (state, action) => {
      state.snackbarSuccess = action.payload;
    },
    setSnackbarError: (state, action) => {
      state.snackbarError = action.payload;
    },
  },
});

export const { setSnackbarSuccess, setSnackbarError } = uiSlice.actions;
export default uiSlice.reducer;
