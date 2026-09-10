import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, logout, fetchCurrentUser } from "../utilities/serverCalls";

// status: "unknown" (haven't checked yet) | "authenticated" | "unauthenticated"
// Starts "unknown" so RequireAuth can wait for checkAuth() to resolve
// before deciding whether to redirect to /login - otherwise a page reload
// on a valid session would flash the login screen every time.

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  try {
    const data = await fetchCurrentUser();
    return data.username;
  } catch {
    return null;
  }
});

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await login(username, password);
      return data.username;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Login failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await logout();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    status: "unknown",
    username: null,
    loginError: null,
    loggingIn: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = action.payload ? "authenticated" : "unauthenticated";
        state.username = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loggingIn = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loggingIn = false;
        state.status = "authenticated";
        state.username = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loggingIn = false;
        state.status = "unauthenticated";
        state.loginError = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "unauthenticated";
        state.username = null;
      });
  },
});

export default authSlice.reducer;
