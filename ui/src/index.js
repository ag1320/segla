import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./state/store";
import { StyledEngineProvider } from "@mui/material/styles";

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <Provider store={store}>
      <Router>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </Router>
    </Provider>
  </StyledEngineProvider>,
  document.getElementById("root")
);
