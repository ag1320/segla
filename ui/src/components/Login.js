import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { loginUser } from "../state/authSlice";
import logo from "../images/Segla.ico";

export default function Login() {
  const dispatch = useDispatch();
  const { status, loginError, loggingIn } = useSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    dispatch(loginUser({ username, password }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: 340 }}>
        <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
          <img src={logo} alt="Segla" style={{ maxHeight: 60 }} />
        </Box>
        <Typography variant="h6" align="center" gutterBottom>
          Sign in to Segla
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {loginError && (
            <Alert severity="error" sx={{ marginTop: 1 }}>
              {loginError}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ marginTop: 2, backgroundColor: "#0F4C75" }}
            disabled={loggingIn}
          >
            {loggingIn ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
