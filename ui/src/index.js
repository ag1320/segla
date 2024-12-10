import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import AppProvider from "./AppContext";
import { StyledEngineProvider } from "@mui/material/styles";

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <AppProvider>
      <Router>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </Router>
    </AppProvider>
  </StyledEngineProvider>,
  document.getElementById("root")
);
