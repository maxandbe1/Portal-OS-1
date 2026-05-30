
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { bootstrapPortal } from "./runtime/bootstrap.js";
import "./styles.css";

bootstrapPortal();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
