import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { checkAuth } from "../state/authSlice";

// Gates everything except /login. On first mount (fresh page load, or a
// deep link) status is "unknown" - fire checkAuth() to ask the API whether
// the session cookie is still valid before deciding to render children or
// bounce to /login, so a valid session doesn't flash the login screen.
export default function RequireAuth({ children }) {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);

  useEffect(() => {
    if (status === "unknown") {
      dispatch(checkAuth());
    }
  }, [status, dispatch]);

  if (status === "unknown") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
