import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store } from "@/app/store";
import { AppRouter } from "@/router";
import "@/index.css";
import { Toaster } from "./components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Provider store={store}>
          <AppRouter />
          <Toaster position="top-center" />
        </Provider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
