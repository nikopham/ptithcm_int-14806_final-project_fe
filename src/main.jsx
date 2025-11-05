import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" />
    </BrowserRouter>
  </Provider>
);
