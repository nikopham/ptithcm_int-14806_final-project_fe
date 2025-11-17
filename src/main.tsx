import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store } from "@/app/store";
import { AppRouter } from "@/router";
import "@/index.css";
import { Toaster } from "./components/ui/sonner";
const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system">
      <Provider store={store}>
        <AppRouter />
        <Toaster position="top-center"/>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
